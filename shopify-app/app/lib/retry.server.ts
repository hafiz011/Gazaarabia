import { log } from "./logger.server";

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A failure is retryable if it's transient: network/timeout, rate limit (429),
// server errors (5xx), or a Shopify GraphQL THROTTLED error.
export function isRetryable(err: unknown): boolean {
  const e = err as any;
  if (!e) return false;
  if (e.name === "AbortError" || e.name === "TimeoutError") return true; // timeout
  if (e.code === "ECONNRESET" || e.code === "ETIMEDOUT" || e.code === "ENOTFOUND") return true;
  if (typeof e.status === "number" && (e.status === 429 || e.status >= 500)) return true;
  if (typeof e.message === "string" && /throttl|rate.?limit|timeout|network|fetch failed/i.test(e.message)) {
    return true;
  }
  return false;
}

export interface RetryOptions {
  retries?: number; //  max additional attempts (default 4)
  baseDelayMs?: number; //  first backoff (default 500)
  maxDelayMs?: number; //  cap (default 15s)
  label?: string; //  for logs
}

// Retries `fn` with exponential backoff + jitter. Stops after `retries` and
// re-throws the last error. Non-retryable errors throw immediately.
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 4, baseDelayMs = 500, maxDelayMs = 15_000, label = "op" } = opts;
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt > retries || !isRetryable(err)) throw err;
      const backoff = Math.min(baseDelayMs * 2 ** (attempt - 1), maxDelayMs);
      const delay = backoff + Math.floor(Math.random() * 250); // jitter (deterministic seed not needed here)
      log.warn("retry.attempt", { label, attempt, delayMs: delay, error: (err as Error).message });
      await sleep(delay);
    }
  }
}
