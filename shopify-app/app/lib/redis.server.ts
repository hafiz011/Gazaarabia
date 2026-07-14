import IORedis from "ioredis";
import { log } from "./logger.server";

// Single shared Redis connection. If REDIS_URL is unset, the whole queue layer
// degrades gracefully (callers fall back to synchronous/background execution),
// so the app keeps working exactly as in M1–M3.

let connection: IORedis | null = null;
let attempted = false;

export function isRedisEnabled(): boolean {
  return Boolean(process.env.REDIS_URL);
}

export function getRedis(): IORedis | null {
  if (attempted) return connection;
  attempted = true;
  const url = process.env.REDIS_URL;
  if (!url) {
    log.warn("redis.disabled", { reason: "REDIS_URL not set" });
    return null;
  }
  connection = new IORedis(url, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });
  connection.on("error", (e) => log.error("redis.error", { error: e.message }));
  return connection;
}

export async function redisHealthy(): Promise<boolean> {
  const r = getRedis();
  if (!r) return false;
  try {
    return (await r.ping()) === "PONG";
  } catch {
    return false;
  }
}
