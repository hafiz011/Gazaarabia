import { prisma } from "@/lib/prisma";
import { buildShopifyOrders } from "./shopifyOrderBuilder";
import { syncLog } from "@/lib/helpers/syncLog";

// Calls the Shopify app's internal /api/push-order for each Shopify seller group
// in a marketplace order, then persists the returned mapping on the seller's
// items. Idempotent: skips seller groups already pushed (externalOrderId set).

const APP = (process.env.SHOPIFY_APP_URL ?? "").replace(/\/+$/, "");
const SECRET = process.env.GAZAARABIA_INTERNAL_SECRET ?? "";

export async function pushShopifyOrders(orderId: number): Promise<void> {
  if (!APP || !SECRET) {
    syncLog("order.push_misconfigured", { orderId });
    return;
  }

  const { groups, errors } = await buildShopifyOrders(orderId);
  if (errors.length) syncLog("order.validation_errors", { orderId, errors });

  for (const g of groups) {
    // Idempotency guard on the Gazaarabia side (the app is idempotent too).
    const already = await prisma.orderItem.findFirst({
      where: { id: { in: g.itemIds }, externalOrderId: { not: null } },
      select: { id: true },
    });
    if (already) {
      syncLog("order.already_pushed", { orderId, sellerId: g.sellerId });
      continue;
    }

    try {
      syncLog("order.submitted", { orderId, sellerId: g.sellerId, shop: g.shop });
      const res = await fetch(`${APP}/api/push-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": SECRET },
        body: JSON.stringify({ shop: g.shop, gazaOrderId: g.gazaOrderId, input: g.input }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();

      // Queued (202): the app's worker will create the order and call back to
      // /order-mapped to store externalOrderId. Nothing to persist here.
      if (data.queued) {
        syncLog("order.queued", { orderId, sellerId: g.sellerId });
        continue;
      }

      if (res.ok && data.ok && data.shopifyOrderGid) {
        // Store the NUMERIC Shopify order id so inbound webhooks (numeric) match.
        const numeric = data.orderNumber ?? String(data.shopifyOrderGid).split("/").pop();
        await prisma.orderItem.updateMany({
          where: { id: { in: g.itemIds } },
          data: {
            externalOrderId: numeric,
            externalOrderName: data.orderName ?? null,
            externalFinancialStatus: data.financialStatus ?? null,
            externalSyncedAt: new Date(),
          },
        });
        syncLog("order.created", {
          orderId,
          sellerId: g.sellerId,
          gid: data.shopifyOrderGid,
          duplicate: !!data.duplicate,
        });
      } else {
        syncLog("order.push_failed", {
          orderId,
          sellerId: g.sellerId,
          status: res.status,
          error: data.error ?? data.errors,
        });
      }
    } catch (e) {
      syncLog("order.push_error", { orderId, sellerId: g.sellerId, error: (e as Error).message });
    }
  }
}
