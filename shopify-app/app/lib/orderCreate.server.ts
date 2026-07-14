// Idempotent Shopify order creation from a pre-built OrderCreateOrderInput.
// The input (incl. line-item Variant GIDs) is built by Gazaarabia — this service
// never does product discovery. Tokens never leave the app (offline session only).

import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { ORDER_CREATE_MUTATION } from "./queries.server";
import { withRetry } from "./retry.server";
import { log } from "./logger.server";

export interface OrderCreateResult {
  ok: boolean;
  status?: number;
  duplicate?: boolean;
  shopifyOrderGid?: string;
  orderNumber?: string | null;
  orderName?: string | null;
  financialStatus?: string | null;
  fulfillmentStatus?: string | null;
  errors?: { field?: string[] | null; message: string }[];
  error?: string;
}

export async function createShopifyOrder(
  shop: string,
  gazaOrderId: string,
  input: any
): Promise<OrderCreateResult> {
  log.info("order.received", { shop, gazaOrderId });

  // ── Idempotency: one Shopify order per (shop, gazaOrderId) ──
  const existing = await db.orderMap.findUnique({
    where: { shop_gazaOrderId: { shop, gazaOrderId } },
  });
  if (existing) {
    log.info("order.duplicate", { shop, gazaOrderId, gid: existing.shopifyOrderGid });
    return {
      ok: true,
      duplicate: true,
      shopifyOrderGid: existing.shopifyOrderGid,
      orderNumber: existing.orderNumber,
      orderName: existing.orderName,
      financialStatus: existing.financialStatus,
      fulfillmentStatus: existing.fulfillmentStatus,
    };
  }

  // ── Offline session (validates the store is still connected) ──
  let admin;
  try {
    ({ admin } = await unauthenticated.admin(shop));
  } catch (e) {
    log.error("order.session_missing", { shop, gazaOrderId, error: (e as Error).message });
    return { ok: false, status: 409, error: "No offline session for shop (reinstall required)" };
  }

  // ── orderCreate with retry / throttle / timeout handled inside admin.graphql ──
  try {
    log.info("order.submitted", { shop, gazaOrderId });
    const body: any = await withRetry(
      async () => {
        const res = await admin.graphql(ORDER_CREATE_MUTATION, { variables: { order: input } });
        const json: any = await res.json();
        if (json.errors?.length) {
          const err: any = new Error(json.errors.map((e: any) => e.message).join("; "));
          if (/throttl/i.test(err.message)) err.status = 429;
          throw err;
        }
        return json;
      },
      { label: "shopify:orderCreate", retries: 4 }
    );

    const payload = body.data?.orderCreate;
    const userErrors = payload?.userErrors ?? [];
    if (userErrors.length || !payload?.order?.id) {
      log.error("order.failed", { shop, gazaOrderId, userErrors });
      return { ok: false, status: 422, errors: userErrors, error: "orderCreate returned userErrors" };
    }

    const order = payload.order;
    const mapping = await db.orderMap.create({
      data: {
        shop,
        gazaOrderId,
        shopifyOrderGid: order.id,
        orderNumber: order.legacyResourceId ? String(order.legacyResourceId) : null,
        orderName: order.name ?? null,
        financialStatus: order.displayFinancialStatus ?? null,
        fulfillmentStatus: order.displayFulfillmentStatus ?? null,
        cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : null,
        syncedAt: new Date(),
      },
    });

    log.info("order.created", { shop, gazaOrderId, gid: order.id, name: order.name });
    return {
      ok: true,
      shopifyOrderGid: mapping.shopifyOrderGid,
      orderNumber: mapping.orderNumber,
      orderName: mapping.orderName,
      financialStatus: mapping.financialStatus,
      fulfillmentStatus: mapping.fulfillmentStatus,
    };
  } catch (e) {
    // A duplicate can slip through under concurrency — fall back to the mapping.
    const race = await db.orderMap.findUnique({
      where: { shop_gazaOrderId: { shop, gazaOrderId } },
    });
    if (race) {
      return { ok: true, duplicate: true, shopifyOrderGid: race.shopifyOrderGid, orderNumber: race.orderNumber, orderName: race.orderName };
    }
    log.error("order.error", { shop, gazaOrderId, error: (e as Error).message });
    return { ok: false, status: 502, error: (e as Error).message };
  }
}
