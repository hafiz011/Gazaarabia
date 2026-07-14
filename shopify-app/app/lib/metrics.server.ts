import { getRedis } from "./redis.server";
import { queueCounts } from "./queue.server";
import { log } from "./logger.server";

// Reusable metrics service. Uses Redis counters when available, else an in-memory
// fallback (per-process). Names are stable so /api/metrics + logs are consistent.

const memory = new Map<string, number>();
const key = (name: string) => `metrics:${name}`;

export const METRIC = {
  productsSynced: "products_synced",
  ordersCreated: "orders_created",
  orderPushFailed: "order_push_failed",
  webhooksReceived: "webhooks_received",
  webhooksDuplicate: "webhooks_duplicate",
  webhooksIgnored: "webhooks_ignored",
  retries: "retries",
  dlqMoved: "dlq_moved",
  shopifyLatency: "shopify_latency_ms", // used with observe()
} as const;

export async function incr(name: string, by = 1): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.incrby(key(name), by);
      return;
    } catch {
      /* fall through to memory */
    }
  }
  memory.set(name, (memory.get(name) ?? 0) + by);
}

// Record a latency/observation (sum + count → average in the snapshot).
export async function observe(name: string, value: number): Promise<void> {
  await incr(`${name}_sum`, value);
  await incr(`${name}_count`, 1);
}

async function get(name: string): Promise<number> {
  const r = getRedis();
  if (r) {
    try {
      return Number(await r.get(key(name))) || 0;
    } catch {
      /* fall through */
    }
  }
  return memory.get(name) ?? 0;
}

export async function metricsSnapshot() {
  const counters: Record<string, number> = {};
  for (const name of Object.values(METRIC)) counters[name] = await get(name);

  const created = counters[METRIC.ordersCreated];
  const failed = counters[METRIC.orderPushFailed];
  const successRate = created + failed > 0 ? created / (created + failed) : 1;

  const latSum = await get(`${METRIC.shopifyLatency}_sum`);
  const latCount = await get(`${METRIC.shopifyLatency}_count`);
  const avgShopifyLatencyMs = latCount > 0 ? latSum / latCount : 0;

  const queues = await queueCounts().catch(() => null);
  const snapshot = { counters, successRate, avgShopifyLatencyMs, queues };
  log.info("metrics.snapshot", { successRate, avgShopifyLatencyMs, queues });
  return snapshot;
}
