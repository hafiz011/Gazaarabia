import type { ActionFunctionArgs } from "@remix-run/node";
import { createShopifyOrder } from "../lib/orderCreate.server";
import { enqueueOrderPush } from "../lib/queue.server";
import { verifyInternalSecret } from "../lib/security.server";
import { rateLimit } from "../lib/rateLimit.server";

// Gazaarabia → create a Shopify order. Queues when Redis is available (crash-safe,
// retried, DLQ) and returns 202; otherwise creates synchronously (preserves M3
// behaviour). Both paths are idempotent (jobId + OrderMap).
export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("[ORDER-PUSH-TRACE][ENTER] api.push-order", { method: request.method, url: request.url });
  if (request.method !== "POST") {
    console.log("[ORDER-PUSH-TRACE][RETURN] api.push-order: method_not_allowed", { method: request.method });
    return new Response("Method Not Allowed", { status: 405 });
  }
  if (!verifyInternalSecret(request)) {
    console.log("[ORDER-PUSH-TRACE][RETURN] api.push-order: unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "internal";
  console.log("[ORDER-PUSH-TRACE][ENTER] rateLimit", { ip });
  const rateLimitStartedAt = Date.now();
  const permitted = await rateLimit(`push-order:${ip}`, 120, 60);
  console.log("[ORDER-PUSH-TRACE][EXIT] rateLimit", { ip, permitted, durationMs: Date.now() - rateLimitStartedAt });
  if (!permitted) {
    console.log("[ORDER-PUSH-TRACE][RETURN] api.push-order: rate_limited", { ip });
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const { shop, gazaOrderId, input } = await request.json();
  console.log("[ORDER-PUSH-TRACE] api.push-order: parsed_body", { shop, gazaOrderId, hasInput: Boolean(input) });
  if (!shop || !gazaOrderId || !input) {
    console.log("[ORDER-PUSH-TRACE][RETURN] api.push-order: missing_required_fields", { hasShop: Boolean(shop), hasGazaOrderId: Boolean(gazaOrderId), hasInput: Boolean(input) });
    return Response.json({ ok: false, error: "shop, gazaOrderId and input are required" }, { status: 400 });
  }

  console.log("[ORDER-PUSH-TRACE][ENTER] enqueueOrderPush", { shop, gazaOrderId: String(gazaOrderId) });
  const queueStartedAt = Date.now();
  const queued = await enqueueOrderPush({ shop, gazaOrderId: String(gazaOrderId), input });
  console.log("[ORDER-PUSH-TRACE][EXIT] enqueueOrderPush", { shop, gazaOrderId: String(gazaOrderId), queued, durationMs: Date.now() - queueStartedAt });
  console.log("[ORDER-PUSH-TRACE] api.push-order: queue_result", { shop, gazaOrderId: String(gazaOrderId), queued });
  if (queued) {
    console.log("[ORDER-PUSH-TRACE][RETURN] api.push-order: queued", { shop, gazaOrderId: String(gazaOrderId) });
    return Response.json({ ok: true, queued: true }, { status: 202 });
  }

  console.log("[ORDER-PUSH-TRACE][ENTER] createShopifyOrder", { shop, gazaOrderId: String(gazaOrderId) });
  const result = await createShopifyOrder(shop, String(gazaOrderId), input);
  console.log("[ORDER-PUSH-TRACE][EXIT] createShopifyOrder", { shop, gazaOrderId: String(gazaOrderId), result });
  return Response.json(result, { status: result.ok ? 200 : (result.status ?? 500) });
};
