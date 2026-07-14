// Maps Shopify order/refund webhook payloads → unified status updates forwarded
// to Gazaarabia. Reuses the hardened gazaarabiaFetch (timeout + retry).

import db from "../db.server";
import { gazaarabiaFetch } from "./gazaarabia.server";
import { log } from "./logger.server";
import { incr, METRIC } from "./metrics.server";

// Phase 1 — ownership filter: only forward webhooks for orders WE created.
// OrderMap is the authoritative source; unknown orders are ignored (never call
// Gazaarabia for a merchant's non-marketplace orders).
async function isMarketplaceOrder(shop: string, orderIdNumeric: string): Promise<boolean> {
  if (!orderIdNumeric) return false;
  const gid = `gid://shopify/Order/${orderIdNumeric}`;
  const owned = await db.orderMap.findFirst({
    where: { shop, OR: [{ orderNumber: orderIdNumeric }, { shopifyOrderGid: gid }] },
    select: { id: true },
  });
  return Boolean(owned);
}

async function ignore(shop: string, topic: string, id: string): Promise<void> {
  await incr(METRIC.webhooksIgnored);
  log.info("order.webhook.ignored", { shop, topic, id, reason: "not_marketplace_order" });
}

// orders/create|updated|paid|fulfilled|partially_fulfilled|cancelled → one update.
export async function forwardOrderStatus(shop: string, topic: string, payload: any): Promise<void> {
  const orderId = String(payload?.id ?? "");
  if (!(await isMarketplaceOrder(shop, orderId))) return ignore(shop, topic, orderId);

  const fulfillments = Array.isArray(payload?.fulfillments) ? payload.fulfillments : [];
  const latest = fulfillments[fulfillments.length - 1];
  const tracking = latest
    ? {
        number: latest.tracking_number ?? null,
        company: latest.tracking_company ?? null,
        url:
          latest.tracking_url ??
          (Array.isArray(latest.tracking_urls) ? latest.tracking_urls[0] : null) ??
          null,
      }
    : null;

  await gazaarabiaFetch("/api/integrations/shopify/order-status", {
    shop,
    topic,
    externalOrderId: String(payload?.id ?? ""), // numeric Shopify order id
    orderName: payload?.name ?? null,
    financialStatus: payload?.financial_status ?? null, // paid | refunded | partially_refunded | pending
    fulfillmentStatus: payload?.fulfillment_status ?? null, // fulfilled | partial | null
    cancelledAt: payload?.cancelled_at ?? null,
    tracking,
  });
  log.info("webhook.processed", { shop, kind: "order.status", topic, id: payload?.id });
}

// orders/delete → mark the mapped items as removed on the Shopify side.
export async function forwardOrderDelete(shop: string, payload: any): Promise<void> {
  const orderId = String(payload?.id ?? "");
  if (!(await isMarketplaceOrder(shop, orderId))) return ignore(shop, "orders/delete", orderId);

  await gazaarabiaFetch("/api/integrations/shopify/order-status", {
    shop,
    topic: "orders/delete",
    externalOrderId: String(payload?.id ?? ""),
    deleted: true,
  });
  log.info("webhook.processed", { shop, kind: "order.delete", id: payload?.id });
}

// refunds/create → synchronize refund state (never recreate the order).
export async function forwardRefund(shop: string, payload: any): Promise<void> {
  const orderId = String(payload?.order_id ?? "");
  if (!(await isMarketplaceOrder(shop, orderId))) return ignore(shop, "refunds/create", orderId);

  const amount = (Array.isArray(payload?.transactions) ? payload.transactions : []).reduce(
    (s: number, t: any) => s + (parseFloat(t?.amount) || 0),
    0
  );
  await gazaarabiaFetch("/api/integrations/shopify/refund", {
    shop,
    externalOrderId: String(payload?.order_id ?? ""),
    refundId: String(payload?.id ?? ""),
    amount,
    reason: payload?.note ?? null,
    createdAt: payload?.created_at ?? null,
  });
  log.info("refund.synchronized", { shop, orderId: payload?.order_id, amount });
}
