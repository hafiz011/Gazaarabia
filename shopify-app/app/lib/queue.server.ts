import { Queue, type JobsOptions } from "bullmq";
import { getRedis } from "./redis.server";
import { log } from "./logger.server";

export const QUEUES = {
  productSync: "product-sync",
  orderPush: "order-push",
  dlq: "dead-letter",
} as const;

// attempts + backoff:"custom" (worker supplies exponential+jitter). Failed jobs
// are kept so the DLQ/monitoring can inspect them.
export const JOB_OPTS: JobsOptions = {
  attempts: 5,
  backoff: { type: "custom" },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

const cache = new Map<string, Queue>();

function getQueue(name: string): Queue | null {
  const conn = getRedis();
  if (!conn) return null;
  let queue = cache.get(name);
  if (!queue) {
    // cast: bundled ioredis type vs bullmq's ConnectionOptions differ nominally.
    queue = new Queue(name, { connection: conn as any });
    cache.set(name, queue);
  }
  return queue;
}

export function queueEnabled(): boolean {
  return getRedis() !== null;
}

// ── Producers ───────────────────────────────────────
export async function enqueueProductSync(data: {
  shop: string;
  mode: "full" | "delta";
  since: string | null;
}): Promise<boolean> {
  const q = getQueue(QUEUES.productSync);
  if (!q) return false;
  // jobId per shop → collapses concurrent sync requests for the same shop.
  await q.add("sync", data, { ...JOB_OPTS, jobId: `sync:${data.shop}` });
  log.info("queue.created", { queue: QUEUES.productSync, shop: data.shop, mode: data.mode });
  return true;
}

export async function enqueueOrderPush(data: {
  shop: string;
  gazaOrderId: string;
  input: any;
}): Promise<boolean> {
  const q = getQueue(QUEUES.orderPush);
  if (!q) return false;
  // jobId = shop+order → BullMQ dedupes duplicate enqueues (idempotency layer 1).
  await q.add("push", data, { ...JOB_OPTS, jobId: `order:${data.shop}:${data.gazaOrderId}` });
  log.info("queue.created", { queue: QUEUES.orderPush, shop: data.shop, gazaOrderId: data.gazaOrderId });
  return true;
}

// ── Monitoring / metrics ────────────────────────────
export async function queueCounts() {
  const read = async (name: string) => {
    const q = getQueue(name);
    if (!q) return null;
    return q.getJobCounts("waiting", "active", "completed", "failed", "delayed");
  };
  return {
    productSync: await read(QUEUES.productSync),
    orderPush: await read(QUEUES.orderPush),
    dlq: await read(QUEUES.dlq),
  };
}

// Move an exhausted job's payload to the DLQ (called by the worker on failure).
export async function dlqAdd(fromQueue: string, data: any): Promise<void> {
  const dlq = getQueue(QUEUES.dlq);
  if (!dlq) return;
  await dlq.add("dead", { ...data, __queue: fromQueue });
}

// ── Dead-letter inspection + replay ─────────────────
export async function dlqList(limit = 50) {
  const q = getQueue(QUEUES.dlq);
  if (!q) return [];
  const jobs = await q.getJobs(["waiting", "completed", "failed"], 0, limit);
  return jobs.map((j) => ({ id: j.id, name: j.name, data: j.data, reason: j.data?.error ?? j.failedReason }));
}

export async function dlqReplay(): Promise<number> {
  const dlq = getQueue(QUEUES.dlq);
  const sync = getQueue(QUEUES.productSync);
  const push = getQueue(QUEUES.orderPush);
  if (!dlq) return 0;
  const jobs = await dlq.getJobs(["waiting", "completed"], 0, 1000);
  let replayed = 0;
  for (const j of jobs) {
    const target = j.data?.__queue === QUEUES.orderPush ? push : sync;
    if (target) {
      const { __queue, error, ...data } = j.data ?? {};
      await target.add(j.name, data, JOB_OPTS);
      await j.remove();
      replayed++;
    }
  }
  log.info("dlq.replayed", { count: replayed });
  return replayed;
}
