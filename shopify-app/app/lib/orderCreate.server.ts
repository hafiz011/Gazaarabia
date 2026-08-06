// Idempotent, claim-first Shopify order creation from a pre-built
// OrderCreateOrderInput. The input (incl. line-item Variant GIDs) is built by
// Gazaarabia — this service never does product discovery. Tokens never leave the
// app (offline session only).
//
// DUPLICATE-SAFETY (unchanged architecture, hardened):
//   1. CLAIM-FIRST: an OrderMap row (status="creating") is inserted BEFORE the
//      Shopify mutation. @@unique([shop, gazaOrderId]) makes a concurrent second
//      request fail at the INSERT — two requests can never both reach orderCreate.
//   2. NO RE-ISSUE ON AMBIGUOUS ERROR: after a timeout/502/reset the mutation may
//      have committed, so we NEVER send another orderCreate in the same request.
//      We reconcile-by-tag with exponential backoff; if still not found we KEEP
//      the claim and return a retryable error — a duplicate is impossible.
//   3. STALE-CLAIM RECOVERY: a claim left "creating" by a crash is recovered
//      (adopted or released) once it ages past SHOPIFY_STALE_CLAIM_MINUTES.

import db from "../db.server";
import { unauthenticated } from "../shopify.server";
import { ORDER_CREATE_MUTATION } from "./queries.server";
import { sleep } from "./retry.server";
import { log } from "./logger.server";
import {
  RECONCILE_CFG,
  findExistingOrderByTag,
  finalizeClaim,
  okFromNode,
  reconcileWithBackoff,
  recoverCreatingClaim,
  type OrderNode,
} from "./orderReconcile.server";
import { resolveCustomerAssociation } from "./orderCustomer.server";

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

/** Throttled = Shopify rejected the query (cost-throttle) → it did NOT commit → safe to retry. */
function isThrottle(e: any): boolean {
  return e?.status === 429 || /throttl|rate.?limit/i.test(e?.message || "");
}
/** Ambiguous = the mutation MAY have committed (we can't tell) → must NOT re-issue. */
function isAmbiguous(e: any): boolean {
  if (e?.name === "AbortError" || e?.name === "TimeoutError") return true;
  if (["ECONNRESET", "ETIMEDOUT", "EPIPE", "ECONNREFUSED"].includes(e?.code)) return true;
  if (typeof e?.status === "number" && [500, 502, 503, 504].includes(e.status)) return true;
  return /timeout|network|fetch failed|socket hang up|econnreset|502|503|504|gateway/i.test(e?.message || "");
}

async function tryClaim(shop: string, gazaOrderId: string): Promise<boolean> {
  console.log("[ORDER-PUSH-TRACE][ENTER] tryClaim", { shop, gazaOrderId });
  try {
    await db.orderMap.create({
      data: { shop, gazaOrderId, shopifyOrderGid: "", status: "creating", syncedAt: new Date() },
    });
    console.log("[ORDER-PUSH-TRACE][WRITE] order_map claim", { shop, gazaOrderId, status: "creating" });
    return true;
  } catch (e: any) {
    if (e?.code === "P2002") {
      console.log("[ORDER-PUSH-TRACE][RETURN] tryClaim: duplicate_claim", { shop, gazaOrderId });
      return false;
    }
    console.error("[ORDER-PUSH-TRACE][ERROR] tryClaim", { shop, gazaOrderId, error: e?.message, stack: e?.stack });
    throw e;
  }
}
async function releaseClaim(shop: string, gazaOrderId: string) {
  await db.orderMap
    .deleteMany({ where: { shop, gazaOrderId, status: "creating" } })
    .catch(() => {});
}

/**
 * Issue orderCreate. On success returns the order. Throws:
 *   err.permanent  → userErrors (never retry; release claim, 422)
 *   err.keepClaim  → ambiguous; may have committed; reconcile found nothing → keep claim (retryable)
 *   err.retryable  → definitely not committed (exhausted throttle) → release claim (fast retry)
 * NEVER issues a second orderCreate after an ambiguous error.
 */
async function attemptOrderCreate(admin: any, orderInput: any, gazaOrderId: string): Promise<OrderNode> {
  let throttleAttempts = 0;
  for (;;) {
    try {
      console.log("[ORDER-PUSH-TRACE][ENTER] admin.graphql(orderCreate)", {
        gazaOrderId,
        mutation: ORDER_CREATE_MUTATION,
        variables: { order: orderInput },
      });
      const res = await admin.graphql(ORDER_CREATE_MUTATION, { variables: { order: orderInput } });
      const json: any = await res.json();
      console.log("[ORDER-PUSH-TRACE][EXIT] admin.graphql(orderCreate)", {
        gazaOrderId,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        response: json,
      });
      if (json.errors?.length) {
        const err: any = new Error(json.errors.map((e: any) => e.message).join("; "));
        if (/throttl/i.test(err.message)) err.status = 429;
        throw err;
      }
      const payload = json.data?.orderCreate;
      const userErrors = payload?.userErrors ?? [];
      if (userErrors.length || !payload?.order?.id) {
        const err: any = new Error("orderCreate returned userErrors");
        err.permanent = true;
        err.userErrors = userErrors;
        throw err;
      }
      return payload.order as OrderNode;
    } catch (e: any) {
      if (e?.permanent) throw e;

      // THROTTLE: not committed → safe to retry the mutation in-request (bounded).
      if (isThrottle(e)) {
        if (throttleAttempts < RECONCILE_CFG.retries) {
          throttleAttempts++;
          const delay =
            RECONCILE_CFG.backoffMs[Math.min(throttleAttempts - 1, RECONCILE_CFG.backoffMs.length - 1)] ?? 2000;
          log.warn("order.throttled", { gazaOrderId, attempt: throttleAttempts, delayMs: delay });
          await sleep(delay);
          continue;
        }
        const err: any = new Error("shopify throttled (retryable)");
        err.retryable = true; // never committed → release claim, retry later
        throw err;
      }

      // AMBIGUOUS or any other post-send error: the mutation MAY have committed.
      // NEVER re-issue orderCreate. Reconcile-by-tag with backoff.
      log.warn("order.ambiguous", { gazaOrderId, error: e?.message, ambiguous: isAmbiguous(e) });
      const found = await reconcileWithBackoff(admin, gazaOrderId);
      if (found) return found;
      const err: any = new Error("orderCreate ambiguous; reconcile found no order (retryable)");
      err.keepClaim = true; // keep the claim — stale recovery will resolve it
      throw err;
    }
  }
}

export async function createShopifyOrder(
  shop: string,
  gazaOrderId: string,
  input: any,
): Promise<OrderCreateResult> {
  console.log("[ORDER-PUSH-TRACE][ENTER] createShopifyOrder", { shop, gazaOrderId });
  log.info("order.received", { shop, gazaOrderId });

  // ── 1. CLAIM-FIRST ──
  let claimed: boolean;
  try {
    claimed = await tryClaim(shop, gazaOrderId);
    if (claimed) log.info("ClaimCreated", { shop, gazaOrderId });
  } catch (e: any) {
    log.error("order.claim_failed", { shop, gazaOrderId, error: e?.message });
    return { ok: false, status: 500, error: "claim failed" };
  }

  // ── 2. Offline session (needed for create AND for adoption/recovery searches) ──
  let admin;
  try {
    ({ admin } = await unauthenticated.admin(shop));
    console.log("[ORDER-PUSH-TRACE][EXIT] unauthenticated.admin", { shop, hasAdmin: Boolean(admin) });
  } catch (e) {
    if (claimed) await releaseClaim(shop, gazaOrderId);
    log.error("order.session_missing", { shop, gazaOrderId, error: (e as Error).message });
    return { ok: false, status: 409, error: "No offline session for shop (reinstall required)" };
  }

  // ── 3. Lost the claim → adopt / recover / defer (NEVER a second orderCreate) ──
  if (!claimed) {
    const existing = await db.orderMap.findUnique({ where: { shop_gazaOrderId: { shop, gazaOrderId } } });
    if (existing && existing.status === "created" && existing.shopifyOrderGid) {
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

    // status === "creating": recover if stale (adopt or release), else defer.
    const outcome = await recoverCreatingClaim(shop, gazaOrderId, admin);
    if (outcome === "FOUND_AND_RECOVERED") {
      const row = await db.orderMap.findUnique({ where: { shop_gazaOrderId: { shop, gazaOrderId } } });
      return row ? { ok: true, duplicate: true, shopifyOrderGid: row.shopifyOrderGid, orderNumber: row.orderNumber, orderName: row.orderName, financialStatus: row.financialStatus, fulfillmentStatus: row.fulfillmentStatus } : { ok: false, status: 409, error: "order creation already in progress" };
    }
    if (outcome === "CLAIM_RELEASED") {
      claimed = await tryClaim(shop, gazaOrderId).catch(() => false); // re-claim after release
      if (claimed) log.info("ClaimCreated", { shop, gazaOrderId, afterRecovery: true });
    }
    if (!claimed) {
      // Fresh claim held by a live worker (NOTHING_TO_DO) or re-claim lost to a racer.
      // Adopt if the order already exists (index may have caught up), else defer to cron.
      const found = await findExistingOrderByTag(admin, gazaOrderId).catch(() => null);
      if (found) {
        await finalizeClaim(shop, gazaOrderId, found).catch(() => {});
        return okFromNode(found, true);
      }
      return { ok: false, status: 409, error: "order creation already in progress" };
    }
  }

  // ── 4. Create (claimed === true). Stamp searchable identity for reconcile. ──
  // Customer reuse: associate an existing Shopify customer by email (never create
  // a duplicate); null → orderCreate creates one from `email` (guest included).
  console.log("[ORDER-PUSH-TRACE][ENTER] resolveCustomerAssociation", { shop, email: input?.email });
  const customer = await resolveCustomerAssociation(admin, input?.email);
  console.log("[ORDER-PUSH-TRACE][EXIT] resolveCustomerAssociation", { shop, email: input?.email, customer });
  const orderInput = {
    ...input,
    ...(customer ? { customer } : {}),
    sourceIdentifier: input?.sourceIdentifier ?? gazaOrderId,
    tags: Array.from(
      new Set([...(Array.isArray(input?.tags) ? input.tags : []), `gaza-order-${gazaOrderId}`]),
    ),
  };

  try {
    log.info("order.submitted", { shop, gazaOrderId });
    const order = await attemptOrderCreate(admin, orderInput, gazaOrderId);
    console.log("[ORDER-PUSH-TRACE][ENTER] finalizeClaim", { shop, gazaOrderId, shopifyOrderGid: order.id });
    const mapping = await finalizeClaim(shop, gazaOrderId, order);
    console.log("[ORDER-PUSH-TRACE][WRITE] order_map finalized", { shop, gazaOrderId, mapping });
    log.info("order.created", { shop, gazaOrderId, gid: order.id, name: order.name });
    return {
      ok: true,
      shopifyOrderGid: mapping.shopifyOrderGid,
      orderNumber: mapping.orderNumber,
      orderName: mapping.orderName,
      financialStatus: mapping.financialStatus,
      fulfillmentStatus: mapping.fulfillmentStatus,
    };
  } catch (e: any) {
    if (e?.permanent) {
      // Business error (userErrors) — the order can't be created as-is; release the claim.
      await releaseClaim(shop, gazaOrderId);
      log.error("order.failed", { shop, gazaOrderId, userErrors: e?.userErrors });
      return { ok: false, status: 422, errors: e?.userErrors ?? [], error: "orderCreate returned userErrors" };
    }
    if (e?.keepClaim) {
      // AMBIGUOUS — the order may exist on Shopify. KEEP the claim so we never
      // re-create; stale recovery (or the next cron pass, once indexed) resolves it.
      log.warn("order.ambiguous_kept_claim", { shop, gazaOrderId, error: e?.message });
      return { ok: false, status: 502, error: e?.message };
    }
    // Definitely not committed (exhausted throttle) → release for a fast retry.
    await releaseClaim(shop, gazaOrderId);
    log.error("order.error", { shop, gazaOrderId, error: e?.message });
    return { ok: false, status: 502, error: e?.message };
  }
}
