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
  const mode: "full" | "delta" = opts.mode ?? (opts.since ? "delta" : "full");
  const query = mode === "delta" && opts.since ? `updated_at:>'${opts.since}'` : undefined;

  // Resume a crashed run from its saved cursor (same mode only).
  const prior = await getSyncState(shop);
  const resuming = prior.status === "running" && !!prior.cursor && prior.mode === mode;

  let cursor: string | null = resuming ? prior.cursor : null;
  let imported = resuming ? prior.synced : 0;
  let skipped = 0;
  let pages = resuming ? prior.pages : 0;

  log.info(resuming ? "sync.resumed" : "sync.started", { shop, mode, since: opts.since ?? null, cursor });
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

  try {
    do {
      // One page, retried (covers throttling / timeouts / transient 5xx).
      const body: any = await withRetry(
        async () => {
          const res = await admin.graphql(PRODUCTS_QUERY, { variables: { cursor, query } });
          const json: any = await res.json();
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

      // Build one page of products WITH all their variants. Products with more
      // variants than the inline page get topped up individually.
      const chunk: any[] = [];
      let variantCount = 0;
      for (const node of conn.nodes) {
        let extra: any[] = [];
        if (node.variants?.pageInfo?.hasNextPage) {
          extra = await fetchRemainingVariants(admin, node.id, node.variants.pageInfo.endCursor);
        }
        const mapped = mapGraphqlProduct(node, extra);
        variantCount += mapped.variants.length;
        chunk.push(mapped);
      }

      const r = await forwardChunk(shop, chunk);
      imported += r.imported;
      skipped += r.skipped;
      pages++;

      // Persist the NEXT cursor as the resume point after this page is forwarded.
      const nextCursor = conn.pageInfo.hasNextPage ? conn.pageInfo.endCursor : null;
      await setSyncState(shop, { synced: imported, pages, cursor: nextCursor, lastCursor: cursor });
      await incr(METRIC.productsSynced, chunk.length);
      log.info("sync.page", { shop, page: pages, products: chunk.length, variants: variantCount, importedTotal: imported });

      await respectThrottle(body.extensions);
      cursor = nextCursor;
    } while (cursor);

    await setSyncState(shop, {
      status: "completed",
      synced: imported,
      pages,
      finishedAt: new Date().toISOString(),
      cursor: null,
    });
    log.info("sync.completed", { shop, mode, imported, skipped, pages });
    return { imported, skipped, pages, mode };
  } catch (err) {
    const message = (err as Error).message;
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
  void (async () => {
    try {
      const summary = await syncProducts(admin, shop, opts);
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
