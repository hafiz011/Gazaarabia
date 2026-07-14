import { Worker, UnrecoverableError, type Job } from "bullmq";
import { getRedis } from "./redis.server";
import { QUEUES, dlqAdd } from "./queue.server";
import { log } from "./logger.server";
import { isRetryable } from "./retry.server";
import { runProductSyncJob } from "./sync.server";
import { createShopifyOrder } from "./orderCreate.server";
import { notifyOrderMapped } from "./gazaarabia.server";
import { incr, observe, METRIC } from "./metrics.server";

// Exponential backoff + jitter (Phase 3). BullMQ calls this per retry.
const backoffStrategy = (attemptsMade: number) =>
  Math.min(1000 * 2 ** attemptsMade, 30_000) + Math.floor(Math.random() * 500);

let started = false;

export function startWorkers(): void {
  if (started) return;
  const connection = getRedis();
  if (!connection) {
    log.warn("workers.disabled", { reason: "no redis" });
    return;
  }
  started = true;
  // cast: bundled ioredis type vs bullmq's ConnectionOptions differ nominally.
  const opts: any = { connection: connection as any, settings: { backoffStrategy } };

  // ── Product sync worker (resumable) ──
  const syncWorker = new Worker(
    QUEUES.productSync,
    async (job: Job) => {
      log.info("queue.started", { queue: QUEUES.productSync, jobId: job.id, shop: job.data.shop });
      try {
        await runProductSyncJob(job.data.shop, { mode: job.data.mode, since: job.data.since });
      } catch (e) {
        if (!isRetryable(e)) throw new UnrecoverableError((e as Error).message); // don't retry
        throw e;
      }
    },
    opts
  );

  // ── Order push worker (idempotent order create) ──
  const pushWorker = new Worker(
    QUEUES.orderPush,
    async (job: Job) => {
      log.info("queue.started", { queue: QUEUES.orderPush, jobId: job.id, gazaOrderId: job.data.gazaOrderId });
      const t0 = Date.now();
      const result = await createShopifyOrder(job.data.shop, job.data.gazaOrderId, job.data.input);
      await observe(METRIC.shopifyLatency, Date.now() - t0);

      if (!result.ok) {
        // 4xx (validation / userErrors / missing session) except 429 → do NOT retry.
        if (result.status && result.status >= 400 && result.status < 500 && result.status !== 429) {
          await incr(METRIC.orderPushFailed);
          throw new UnrecoverableError(result.error ?? "order create failed");
        }
        throw new Error(result.error ?? "order create failed"); // transient → retry
      }

      await incr(METRIC.ordersCreated);
      await notifyOrderMapped(job.data.shop, job.data.gazaOrderId, result);
    },
    opts
  );

  for (const [name, w] of [
    [QUEUES.productSync, syncWorker],
    [QUEUES.orderPush, pushWorker],
  ] as const) {
    w.on("completed", (job) => log.info("queue.completed", { queue: name, jobId: job.id }));
    w.on("failed", async (job, err) => {
      const maxAttempts = job?.opts.attempts ?? 1;
      log.error("queue.failed", { queue: name, jobId: job?.id, attempt: job?.attemptsMade, error: err.message });
      if (job && job.attemptsMade >= maxAttempts) {
        // Exhausted → Dead Letter Queue (never silently discarded).
        log.error("retry.exhausted", { queue: name, jobId: job.id });
        await dlqAdd(name, { ...job.data, error: err.message });
        await incr(METRIC.dlqMoved);
        log.error("dlq.moved", { queue: name, jobId: job.id });
      } else {
        await incr(METRIC.retries);
        log.warn("retry.scheduled", { queue: name, jobId: job?.id, attempt: job?.attemptsMade });
      }
    });
  }

  log.info("workers.started", { queues: [QUEUES.productSync, QUEUES.orderPush] });
}
