// Product synchronization engine.
//
// Memory-efficient: fetches one GraphQL page (100 products) at a time and
// forwards that page to Gazaarabia immediately — the full catalog is never held
// in memory, so 100k+ product stores are supported. Rate-limit aware, retried,
// delta-capable, and reports live progress via syncState.

import { PRODUCTS_QUERY, PRODUCT_VARIANTS_QUERY } from "./queries.server";
import { gazaarabiaFetch } from "./gazaarabia.server";
import { mapGraphqlProduct } from "./productMap.server";
import { withRetry, sleep } from "./retry.server";
import { getSyncState, setSyncState } from "./syncState.server";
import { log } from "./logger.server";
import { incr, METRIC } from "./metrics.server";
import { unauthenticated } from "../shopify.server";

const THROTTLE_FLOOR = 200; // wait if the GraphQL cost bucket drops below this

export interface SyncOptions {
  mode?: "full" | "delta";
  since?: string | null; // ISO timestamp for delta
}

export interface SyncSummary {
  imported: number;
  skipped: number;
  pages: number;
  mode: "full" | "delta";
}

// Forward one page to Gazaarabia (idempotent upsert on their side).
async function forwardChunk(shop: string, products: any[]) {
  if (products.length === 0) return { imported: 0, skipped: 0 };
  const res = await gazaarabiaFetch("/api/integrations/shopify/products", { shop, products });
  return {
    imported: typeof res?.imported === "number" ? res.imported : products.length,
    skipped: typeof res?.skipped === "number" ? res.skipped : 0,
  };
}

// Tops up variants for a product that has more than the inline page (25). Only
// called for products that actually exceed it, so this is NOT a per-product N+1.
async function fetchRemainingVariants(admin: any, productId: string, startCursor: string): Promise<any[]> {
  const all: any[] = [];
  let cursor: string | null = startCursor;
  do {
    const body: any = await withRetry(
      async () => {
        const res = await admin.graphql(PRODUCT_VARIANTS_QUERY, { variables: { id: productId, cursor } });
        const json = await res.json();
        if (json.errors?.length) {
          const e: any = new Error(json.errors.map((x: any) => x.message).join("; "));
          if (/throttl/i.test(e.message)) e.status = 429;
          throw e;
        }
        return json;
      },
      { label: "shopify:variants", retries: 5 }
    );
    const vconn = body.data.product?.variants;
    if (!vconn) break;
    all.push(...vconn.nodes);
    await respectThrottle(body.extensions);
    cursor = vconn.pageInfo.hasNextPage ? vconn.pageInfo.endCursor : null;
  } while (cursor);
  return all;
}

// Read Shopify's cost bucket and pause if we're running low, so we never spam
// the API into a hard throttle.
async function respectThrottle(extensions: any) {
  const t = extensions?.cost?.throttleStatus;
  if (!t || typeof t.currentlyAvailable !== "number") return;
  if (t.currentlyAvailable < THROTTLE_FLOOR) {
    const restore = Math.max(t.restoreRate || 50, 1);
    const waitMs = Math.min(Math.ceil(((THROTTLE_FLOOR - t.currentlyAvailable) / restore) * 1000), 5000);
    log.warn("ratelimit.delay", { available: t.currentlyAvailable, waitMs });
    await sleep(waitMs);
  }
}

export async function syncProducts(admin: any, shop: string, opts: SyncOptions = {}): Promise<SyncSummary> {
  console.log("[SYNC][ENTER] syncProducts", { shop, opts }); // TEMP DIAGNOSTIC
  const mode: "full" | "delta" = opts.mode ?? (opts.since ? "delta" : "full");
  const query = mode === "delta" && opts.since ? `updated_at:>'${opts.since}'` : undefined;

  // Resume a crashed run from its saved cursor (same mode only).
  const __tPrior = Date.now(); // TEMP DIAGNOSTIC
  console.log("[SYNC][ENTER] getSyncState(prior)", { shop });
  const prior = await getSyncState(shop);
  console.log(`[SYNC][EXIT] getSyncState(prior) (${Date.now() - __tPrior}ms)`, { shop, status: prior.status });
  const resuming = prior.status === "running" && !!prior.cursor && prior.mode === mode;

  let cursor: string | null = resuming ? prior.cursor : null;
  let imported = resuming ? prior.synced : 0;
  let skipped = 0;
  let pages = resuming ? prior.pages : 0;

  log.info(resuming ? "sync.resumed" : "sync.started", { shop, mode, since: opts.since ?? null, cursor });
  const __tSetRun = Date.now(); // TEMP DIAGNOSTIC
  console.log("[SYNC][ENTER] setSyncState(running)", { shop, cursor, imported, pages });
  await setSyncState(shop, {
    status: "running",
    mode,
    synced: imported,
    pages,
    error: null,
    startedAt: prior.startedAt ?? new Date().toISOString(),
    finishedAt: null,
    cursor,
  });
  console.log(`[SYNC][EXIT] setSyncState(running) (${Date.now() - __tSetRun}ms)`, { shop, cursor, imported, pages });

  try {
    do {
      console.log("[SYNC] loop top", { shop, cursor, imported, pages }); // TEMP DIAGNOSTIC
      // One page, retried (covers throttling / timeouts / transient 5xx).
      const body: any = await withRetry(
        async () => {
          const __tGql = Date.now(); // TEMP DIAGNOSTIC
          console.log("[SYNC][ENTER] GraphQL", { shop, cursor, imported, pages });
          const res = await admin.graphql(PRODUCTS_QUERY, { variables: { cursor, query } });
          console.log(`[SYNC][EXIT] GraphQL (${Date.now() - __tGql}ms)`, { shop, cursor });
          const __tJson = Date.now(); // TEMP DIAGNOSTIC
          console.log("[SYNC][ENTER] res.json", { shop, cursor });
          const json: any = await res.json();
          console.log(`[SYNC][EXIT] res.json (${Date.now() - __tJson}ms)`, { shop, cursor, errors: json.errors?.length ?? 0 });
          if (json.errors?.length) {
            const err: any = new Error(json.errors.map((e: any) => e.message).join("; "));
            if (/throttl/i.test(err.message)) err.status = 429;
            throw err;
          }
          return json;
        },
        { label: "shopify:products", retries: 5 }
      );

      const conn = body.data.products;
      console.log("[SYNC] products received", { shop, count: conn?.nodes?.length, hasNextPage: conn?.pageInfo?.hasNextPage }); // TEMP DIAGNOSTIC

      // Build one page of products WITH all their variants. Products with more
      // variants than the inline page get topped up individually.
      const chunk: any[] = [];
      let variantCount = 0;
      const __tBuild = Date.now(); // TEMP DIAGNOSTIC
      console.log("[SYNC][ENTER] buildChunk (mapGraphqlProduct)", { shop, nodes: conn?.nodes?.length });
      for (const node of conn.nodes) {
        let extra: any[] = [];
        if (node.variants?.pageInfo?.hasNextPage) {
          const __tVar = Date.now(); // TEMP DIAGNOSTIC
          console.log("[SYNC][ENTER] fetchRemainingVariants", { shop, productId: node.id });
          extra = await fetchRemainingVariants(admin, node.id, node.variants.pageInfo.endCursor);
          console.log(`[SYNC][EXIT] fetchRemainingVariants (${Date.now() - __tVar}ms)`, { shop, productId: node.id, extra: extra.length });
        }
        const mapped = mapGraphqlProduct(node, extra);
        variantCount += mapped.variants.length;
        chunk.push(mapped);
      }
      console.log(`[SYNC][EXIT] buildChunk (mapGraphqlProduct) (${Date.now() - __tBuild}ms)`, { shop, chunk: chunk.length, variantCount }); // TEMP DIAGNOSTIC

      const __tFwd = Date.now(); // TEMP DIAGNOSTIC
      console.log("[SYNC][ENTER] forwardChunk", { shop, cursor, chunk: chunk.length, imported, pages });
      const r = await forwardChunk(shop, chunk);
      console.log(`[SYNC][EXIT] forwardChunk (${Date.now() - __tFwd}ms)`, { shop, cursor, result: r });
      imported += r.imported;
      skipped += r.skipped;
      pages++;

      // Persist the NEXT cursor as the resume point after this page is forwarded.
      const nextCursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
      const __tSet = Date.now(); // TEMP DIAGNOSTIC
      console.log("[SYNC][ENTER] setSyncState(progress)", { shop, cursor: nextCursor, imported, pages });
      await setSyncState(shop, { synced: imported, pages, cursor: nextCursor, lastCursor: cursor });
      console.log(`[SYNC][EXIT] setSyncState(progress) (${Date.now() - __tSet}ms)`, { shop, imported, pages });
      const __tIncr = Date.now(); // TEMP DIAGNOSTIC
      console.log("[SYNC][ENTER] incr(metrics)", { shop });
      await incr(METRIC.productsSynced, chunk.length);
      console.log(`[SYNC][EXIT] incr(metrics) (${Date.now() - __tIncr}ms)`, { shop });
      log.info("sync.page", { shop, page: pages, products: chunk.length, variants: variantCount, importedTotal: imported });

      const __tThr = Date.now(); // TEMP DIAGNOSTIC
      console.log("[SYNC][ENTER] respectThrottle", { shop, pages });
      await respectThrottle(body.extensions);
      console.log(`[SYNC][EXIT] respectThrottle (${Date.now() - __tThr}ms)`, { shop, pages });
      cursor = nextCursor;
    } while (cursor);

    const __tDone = Date.now(); // TEMP DIAGNOSTIC
    console.log("[SYNC][ENTER] setSyncState(completed)", { shop, imported, pages });
    await setSyncState(shop, {
      status: "completed",
      synced: imported,
      pages,
      finishedAt: new Date().toISOString(),
      cursor: null,
    });
    console.log(`[SYNC][EXIT] setSyncState(completed) (${Date.now() - __tDone}ms)`, { shop, imported, pages }); // TEMP DIAGNOSTIC
    console.log("[SYNC] completed", { shop, imported, skipped, pages }); // TEMP DIAGNOSTIC
    log.info("sync.completed", { shop, mode, imported, skipped, pages });
    return { imported, skipped, pages, mode };
  } catch (err) {
    const message = (err as Error).message;
    console.log("[SYNC][CATCH] exception:", message); // TEMP DIAGNOSTIC
    await setSyncState(shop, { status: "failed", error: message, finishedAt: new Date().toISOString() });
    log.error("sync.failed", { shop, mode, error: message, pagesDone: pages });
    throw err;
  }
}

// Worker entrypoint: derive an offline admin client for the shop, run the sync
// (resumable), and persist the watermark. Throws on failure so the queue can
// retry/DLQ.
export async function runProductSyncJob(shop: string, opts: SyncOptions): Promise<void> {
  const { admin } = await unauthenticated.admin(shop);
  try {
    const summary = await syncProducts(admin, shop, opts);
    const state = await getSyncState(shop);
    await gazaarabiaFetch("/api/integrations/shopify/sync-complete", {
      shop,
      syncedAt: state.startedAt ?? new Date().toISOString(),
      status: "success",
      imported: summary.imported,
      skipped: summary.skipped,
      syncType: `shopify-${summary.mode}`,
    }).catch(() => {});
  } catch (err) {
    await gazaarabiaFetch("/api/integrations/shopify/sync-complete", {
      shop,
      syncedAt: new Date().toISOString(),
      status: "failed",
      error: (err as Error).message,
      syncType: `shopify-${opts.mode ?? "full"}`,
    }).catch(() => {});
    throw err;
  }
}

// Fire-and-forget. The PM2-managed Node process keeps running after the HTTP
// response returns, so the sync continues in the background without blocking the
// request handler. On finish it tells Gazaarabia to persist last-sync time.
export function startSyncInBackground(
  admin: any,
  shop: string,
  opts: SyncOptions & { startedAtIso: string }
): void {
  console.log("[SYNC] startSyncInBackground called", { shop, opts }); // TEMP DIAGNOSTIC
  void (async () => {
    console.log("[SYNC] background IIFE entered", { shop }); // TEMP DIAGNOSTIC
    try {
      const __tSync = Date.now(); // TEMP DIAGNOSTIC
      console.log("[SYNC][ENTER] syncProducts(top)", { shop });
      const summary = await syncProducts(admin, shop, opts);
      console.log(`[SYNC][EXIT] syncProducts(top) (${Date.now() - __tSync}ms)`, { shop, summary });
      await gazaarabiaFetch("/api/integrations/shopify/sync-complete", {
        shop,
        // last-sync = when we STARTED, so the next delta can't miss products
        // changed mid-run.
        syncedAt: opts.startedAtIso,
        status: "success",
        imported: summary.imported,
        skipped: summary.skipped,
        syncType: `shopify-${summary.mode}`,
      }).catch(() => {});
    } catch (err) {
      await gazaarabiaFetch("/api/integrations/shopify/sync-complete", {
        shop,
        syncedAt: opts.startedAtIso,
        status: "failed",
        error: (err as Error).message,
        syncType: `shopify-${opts.mode ?? "full"}`,
      }).catch(() => {});
    }
  })();
}
