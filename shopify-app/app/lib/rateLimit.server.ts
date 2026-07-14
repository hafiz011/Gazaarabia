import { getRedis } from "./redis.server";

// Lightweight fixed-window rate limiter. Uses Redis when available (shared across
// instances), else an in-memory fallback. Returns true if the request is allowed.
const memory = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<boolean> {
  const r = getRedis();
  if (r) {
    try {
      const k = `rl:${key}`;
      const count = await r.incr(k);
      if (count === 1) await r.expire(k, windowSec);
      return count <= limit;
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const rec = memory.get(key);
  if (!rec || rec.reset < now) {
    memory.set(key, { count: 1, reset: now + windowSec * 1000 });
    return true;
  }
  rec.count += 1;
  return rec.count <= limit;
}
