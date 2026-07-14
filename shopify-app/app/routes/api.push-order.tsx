import type { ActionFunctionArgs } from "@remix-run/node";
import { createShopifyOrder } from "../lib/orderCreate.server";
import { enqueueOrderPush } from "../lib/queue.server";
import { verifyInternalSecret } from "../lib/security.server";
import { rateLimit } from "../lib/rateLimit.server";

// Gazaarabia → create a Shopify order. Queues when Redis is available (crash-safe,
// retried, DLQ) and returns 202; otherwise creates synchronously (preserves M3
// behaviour). Both paths are idempotent (jobId + OrderMap).
export const action = async ({ request }: ActionFunctionArgs) => {
  if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!verifyInternalSecret(request)) return new Response("Unauthorized", { status: 401 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "internal";
  if (!(await rateLimit(`push-order:${ip}`, 120, 60))) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { shop, gazaOrderId, input } = await request.json();
  if (!shop || !gazaOrderId || !input) {
    return Response.json({ ok: false, error: "shop, gazaOrderId and input are required" }, { status: 400 });
  }

  const queued = await enqueueOrderPush({ shop, gazaOrderId: String(gazaOrderId), input });
  if (queued) return Response.json({ ok: true, queued: true }, { status: 202 });

  const result = await createShopifyOrder(shop, String(gazaOrderId), input);
  return Response.json(result, { status: result.ok ? 200 : (result.status ?? 500) });
};
