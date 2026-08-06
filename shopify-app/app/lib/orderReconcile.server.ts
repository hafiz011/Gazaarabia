// Reconciliation + stale-claim recovery for the claim-first order pipeline.
//
// This module is the reusable safety layer around Shopify orderCreate. It is
// callable from the order-create path, the cron, a manual retry, or a future
// health check. It never issues orderCreate itself — it only SEARCHES Shopify
// (by our unique per-order tag) and repairs the OrderMap claim accordingly.
//
// Config (safe defaults; all optional — backward compatible):
//   SHOPIFY_RECONCILE_RETRIES     backoff searches after the first (default 4)
//   SHOPIFY_RECONCILE_BACKOFF_MS  comma list of delays  (default "2000,5000,10000,20000")
//   SHOPIFY_STALE_CLAIM_MINUTES   age after which a "creating" claim is stale (default 5)

import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { ORDER_BY_TAG_QUERY } from "./queries.server";
import { sleep } from "./retry.server";
import { log } from "./logger.server";

export type OrderNode = {
  id: string;
  name?: string | null;
  legacyResourceId?: string | null;
  displayFinancialStatus?: string | null;
  displayFulfillmentStatus?: string | null;
  cancelledAt?: string | null;
};

export type RecoverOutcome = "FOUND_AND_RECOVERED" | "CLAIM_RELEASED" | "NOTHING_TO_DO";

function parseIntEnv(v: string | undefined, dflt: number, min: number): number {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n >= min ? n : dflt;
}
function parseBackoff(v: string | undefined): number[] {
  const list = (v ?? "")
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 0);
  return list.length ? list : [2000, 5000, 10000, 20000];
}

export const RECONCILE_CFG = {
  retries: parseIntEnv(process.env.SHOPIFY_RECONCILE_RETRIES, 4, 0),
  backoffMs: parseBackoff(process.env.SHOPIFY_RECONCILE_BACKOFF_MS),
  staleClaimMinutes: parseIntEnv(process.env.SHOPIFY_STALE_CLAIM_MINUTES, 5, 1),
};

/** Search Shopify for the order we stamp with `gaza-order-<gazaOrderId>`. */
export async function findExistingOrderByTag(
  admin: any,
  gazaOrderId: string,
): Promise<OrderNode | null> {
  const res = await admin.graphql(ORDER_BY_TAG_QUERY, {
    variables: { query: `tag:'gaza-order-${gazaOrderId}'` },
  });
  const json: any = await res.json();
  return json?.data?.orders?.edges?.[0]?.node ?? null;
}

/** Persist the created/adopted order onto the claim row (idempotent upsert → "created"). */
export async function finalizeClaim(shop: string, gazaOrderId: string, order: OrderNode) {
  const data = {
    shopifyOrderGid: order.id,
    orderNumber: order.legacyResourceId ? String(order.legacyResourceId) : null,
    orderName: order.name ?? null,
    financialStatus: order.displayFinancialStatus ?? null,
    fulfillmentStatus: order.displayFulfillmentStatus ?? null,
    cancelledAt: order.cancelledAt ? new Date(order.cancelledAt) : null,
    status: "created",
    syncedAt: new Date(),
  };
  return db.orderMap.upsert({
    where: { shop_gazaOrderId: { shop, gazaOrderId } },
    update: data,
    create: { shop, gazaOrderId, ...data },
  });
}

export function okFromNode(order: OrderNode, duplicate = false) {
  return {
    ok: true as const,
    duplicate,
    shopifyOrderGid: order.id,
    orderNumber: order.legacyResourceId ? String(order.legacyResourceId) : null,
    orderName: order.name ?? null,
    financialStatus: order.displayFinancialStatus ?? null,
    fulfillmentStatus: order.displayFulfillmentStatus ?? null,
  };
}

/**
 * TASK 1 — reconcile with exponential backoff. After an AMBIGUOUS orderCreate
 * error (timeout/502/reset), the order MAY have committed but Shopify's search
 * index lags. Search immediately, then retry the SEARCH (never orderCreate) with
 * backoff. Returns the order if found, or null after every attempt fails.
 */
export async function reconcileWithBackoff(
  admin: any,
  gazaOrderId: string,
): Promise<OrderNode | null> {
  const search = async (attempt: number): Promise<OrderNode | null> => {
    log.info("ReconcileAttempt", { gazaOrderId, attempt });
    const found = await findExistingOrderByTag(admin, gazaOrderId).catch((e: any) => {
      log.warn("ReconcileError", { gazaOrderId, attempt, error: e?.message });
      return null;
    });
    if (found) log.info("ReconcileFoundOrder", { gazaOrderId, gid: found.id, attempt });
    return found;
  };

  let found = await search(0);
  if (found) return found;
  for (let i = 1; i <= RECONCILE_CFG.retries; i++) {
    const delay = RECONCILE_CFG.backoffMs[Math.min(i - 1, RECONCILE_CFG.backoffMs.length - 1)] ?? 2000;
    await sleep(delay);
    found = await search(i);
    if (found) return found;
  }
  log.warn("ReconcileTimeout", { gazaOrderId, searches: RECONCILE_CFG.retries + 1 });
  return null;
}

/**
 * TASK 2/3 — recover a stale "creating" claim (crash before finalize). Idempotent
 * and safe to call concurrently. A claim is stale when status="creating" and its
 * createdAt is older than SHOPIFY_STALE_CLAIM_MINUTES (a "creating" row is written
 * exactly once, so createdAt == claim age — no updatedAt column needed).
 *
 *   FOUND_AND_RECOVERED  the order existed on Shopify → claim finalized to "created"
 *   CLAIM_RELEASED       no order existed → stale claim deleted so a retry can proceed
 *   NOTHING_TO_DO        no claim, not "creating", still fresh, or no offline session
 */
export async function recoverCreatingClaim(
  shop: string,
  gazaOrderId: string,
  adminOverride?: any,
): Promise<RecoverOutcome> {
  const claim = await db.orderMap.findUnique({
    where: { shop_gazaOrderId: { shop, gazaOrderId } },
  });
  if (!claim || claim.status !== "creating") return "NOTHING_TO_DO";

  const ageMs = Date.now() - new Date(claim.createdAt).getTime();
  if (ageMs < RECONCILE_CFG.staleClaimMinutes * 60_000) return "NOTHING_TO_DO"; // fresh — a live worker may hold it

  let admin = adminOverride;
  if (!admin) {
    try {
      ({ admin } = await unauthenticated.admin(shop));
    } catch (e) {
      // Can't verify without a session; leave the claim for a later pass (post reinstall).
      log.warn("ClaimRecoverNoSession", { shop, gazaOrderId, error: (e as Error).message });
      return "NOTHING_TO_DO";
    }
  }

  const found = await findExistingOrderByTag(admin, gazaOrderId).catch(() => null);
  if (found) {
    await finalizeClaim(shop, gazaOrderId, found).catch(() => {});
    log.info("ClaimRecovered", { shop, gazaOrderId, gid: found.id });
    return "FOUND_AND_RECOVERED";
  }

  // No order exists → release ONLY if still "creating" (avoid racing a concurrent finalize).
  const del = await db.orderMap.deleteMany({ where: { shop, gazaOrderId, status: "creating" } });
  if (del.count > 0) {
    log.info("ClaimReleased", { shop, gazaOrderId });
    return "CLAIM_RELEASED";
  }
  return "NOTHING_TO_DO"; // someone finalized/released concurrently
}
