import { prisma } from "@/lib/prisma";
import { buildShopifyOrders } from "./shopifyOrderBuilder";
import { syncLog } from "@/lib/helpers/syncLog";

// Calls the Shopify app's internal /api/push-order for each Shopify seller group
// in a marketplace order, then persists the returned mapping on the seller's
// items. Idempotent: skips seller groups already pushed (externalOrderId set).

// Read at CALL time, not module-import time. Module-level consts are evaluated
// once when the module is first imported, so an env var that is loaded later (or
// changed) is never picked up, and a missing var silently disables the whole push
// for the lifetime of the process. Resolving per call makes the config observable
// and removes the import-order dependency.
const appBaseUrl = () => (process.env.SHOPIFY_APP_URL ?? "").replace(/\/+$/, "");
const internalSecret = () => process.env.GAZAARABIA_INTERNAL_SECRET ?? "";

export async function pushShopifyOrders(orderId: number): Promise<void> {
  const APP = appBaseUrl();
  const SECRET = internalSecret();
  console.log("[ORDER-PUSH-TRACE][ENTER] pushShopifyOrders", {
    orderId,
    app: APP,
    hasInternalSecret: Boolean(SECRET),
  });

  if (!APP || !SECRET) {
    console.log("[ORDER-PUSH-TRACE][RETURN] pushShopifyOrders: missing_configuration", {
      orderId,
      hasApp: Boolean(APP),
      hasInternalSecret: Boolean(SECRET),
    });
    // Name the missing variable(s) — previously this logged nothing actionable,
    // so a misconfigured deploy silently dropped every Shopify order push.
    syncLog("order.push_misconfigured", {
      orderId,
      missing: [!APP && "SHOPIFY_APP_URL", !SECRET && "GAZAARABIA_INTERNAL_SECRET"].filter(Boolean),
    });
    return;
  }

  console.log("[ORDER-PUSH-TRACE][ENTER] buildShopifyOrders", { orderId });
  const { groups, errors } = await buildShopifyOrders(orderId);
  console.log("[ORDER-PUSH-TRACE][EXIT] buildShopifyOrders", {
    orderId,
    groupCount: groups.length,
    errors,
  });
  if (errors.length) syncLog("order.validation_errors", { orderId, errors });

  for (const g of groups) {
    // Idempotency guard on the Gazaarabia side (the app is idempotent too).
    const already = await prisma.orderItem.findFirst({
      where: { id: { in: g.itemIds }, externalOrderId: { not: null } },
      select: { id: true },
    });
    if (already) {
      console.log("[ORDER-PUSH-TRACE][SKIP] seller_group_already_mapped", { orderId, sellerId: g.sellerId });
      syncLog("order.already_pushed", { orderId, sellerId: g.sellerId });
      continue;
    }

    try {
      const url = `${APP}/api/push-order`;
      const requestBody = { shop: g.shop, gazaOrderId: g.gazaOrderId, input: g.input };
      console.log("[ORDER-PUSH-TRACE][ENTER] POST /api/push-order", {
        orderId,
        sellerId: g.sellerId,
        url,
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": "[REDACTED]" },
        body: requestBody,
      });
      syncLog("order.submitted", { orderId, sellerId: g.sellerId, shop: g.shop });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-internal-secret": SECRET },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json();
      console.log("[ORDER-PUSH-TRACE][EXIT] POST /api/push-order", {
        orderId,
        sellerId: g.sellerId,
        status: res.status,
        ok: res.ok,
        response: data,
      });

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
        console.log("[ORDER-PUSH-TRACE][WRITE] orderItem.externalOrderId", {
          orderId,
          sellerId: g.sellerId,
          externalOrderId: numeric,
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
      console.error("[ORDER-PUSH-TRACE][ERROR] POST /api/push-order", {
        orderId,
        sellerId: g.sellerId,
        error: (e as Error).message,
        stack: (e as Error).stack,
        cause: (e as any)?.cause,
      });
      syncLog("order.push_error", { orderId, sellerId: g.sellerId, error: (e as Error).message });
    }
  }
}
