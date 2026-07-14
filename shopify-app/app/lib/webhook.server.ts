import { authenticate } from "../shopify.server";
import db from "../db.server";
import { log } from "./logger.server";
import { incr, METRIC } from "./metrics.server";

// Persistent webhook idempotency (dedup by X-Shopify-Webhook-Id). Marked only on
// SUCCESS, so a failed (500 → Shopify-retried) delivery re-runs. Idempotent
// business logic makes both duplicate and retry safe.
async function isDuplicate(webhookId: string): Promise<boolean> {
  if (!webhookId) return false;
  return Boolean(await db.webhookEvent.findUnique({ where: { webhookId } }));
}

async function markProcessed(webhookId: string, topic?: string, shop?: string): Promise<void> {
  if (!webhookId) return;
  try {
    await db.webhookEvent.create({ data: { webhookId, topic, shop } });
  } catch {
    /* unique race — already recorded */
  }
}

export interface WebhookCtx {
  shop: string;
  topic: string;
  payload: any;
  admin: any;
  session: any;
  webhookId: string;
}

// Shared handler for every webhook route: HMAC verification (authenticate.webhook)
// + dedup + structured logging + metrics. Keeps routes to one line.
export async function processWebhook(
  request: Request,
  handler: (ctx: WebhookCtx) => Promise<void>
): Promise<Response> {
  const { shop, topic, payload, admin, session, webhookId } = await authenticate.webhook(request);
  await incr(METRIC.webhooksReceived);
  log.info("webhook.received", { shop, topic, webhookId });

  if (await isDuplicate(webhookId)) {
    await incr(METRIC.webhooksDuplicate);
    log.info("webhook.duplicate", { shop, topic, webhookId });
    return new Response();
  }

  try {
    await handler({ shop, topic, payload, admin, session, webhookId });
    await markProcessed(webhookId, topic, shop);
  } catch (e) {
    log.error("webhook.failed", { shop, topic, webhookId, error: (e as Error).message });
    return new Response("error", { status: 500 }); // Shopify retries; not marked
  }
  return new Response();
}
