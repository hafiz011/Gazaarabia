// Thin server-to-server client for the Gazaarabia marketplace backend.
// Every call carries a shared secret header so the backend can trust it.

import { withRetry } from "./retry.server";

const BASE = (process.env.GAZAARABIA_API_URL ?? "").replace(/\/+$/, "");
const SECRET = process.env.GAZAARABIA_INTERNAL_SECRET ?? "";
const TIMEOUT_MS = 15_000;

// Hardened: per-request timeout + retry with backoff on transient failures.
export async function gazaarabiaFetch(path: string, body: unknown): Promise<any> {
  if (!BASE) throw new Error("GAZAARABIA_API_URL is not set");

  return withRetry(
    async () => {
      const res = await fetch(`${BASE}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": SECRET,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const err: any = new Error(`gazaarabia ${path} failed: ${res.status} ${text}`);
        err.status = res.status; // lets isRetryable() see 429/5xx
        throw err;
      }
      return res.json().catch(() => ({}));
    },
    { label: `gazaarabia:${path}`, retries: 3 }
  );
}

// Tell Gazaarabia which Shopify order a marketplace order maps to, so it can
// store externalOrderId on the seller's items (order-push worker → callback).
export async function notifyOrderMapped(shop: string, gazaOrderId: string, result: any): Promise<void> {
  await gazaarabiaFetch("/api/integrations/shopify/order-mapped", {
    shop,
    gazaOrderId,
    shopifyOrderGid: result.shopifyOrderGid,
    orderNumber: result.orderNumber ?? null,
    orderName: result.orderName ?? null,
    financialStatus: result.financialStatus ?? null,
  });
}
