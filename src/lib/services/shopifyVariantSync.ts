import { prisma } from "@/lib/prisma";
import { syncLog } from "@/lib/helpers/syncLog";

// Milestone 2.6: variants are matched by their permanent Shopify Variant GID
// (externalVariantId), never by SKU. SKU is metadata only. Legacy rows synced
// before 2.6 (no GID, keyed by sku) are backfilled in place on the next sync.

function numericId(gid: string): string {
  return String(gid ?? "").split("/").pop() || "";
}

// Only used to locate legacy (pre-2.6) rows for backfill — NOT for identity.
export function variantMatchKey(sku: string | null | undefined, externalVariantId: string): string {
  const s = (sku ?? "").trim();
  return s || `svar-${numericId(externalVariantId)}`;
}

// Maps a forwarded NormalizedVariant to productvariant columns.
function buildVariantData(v: any): any {
  const sku = (v.sku ?? "").trim() || variantMatchKey(v.sku, v.externalVariantId);
  return {
    sku, // stays non-null (column is required); identity lives in externalVariantId
    price: Number(v.price) || 0,
    stock: Math.max(0, Math.trunc(Number(v.inventoryQuantity) || 0)),
    isActive: true,
    externalVariantId: v.externalVariantId || null,
    externalProductId: v.externalProductId || null,
    inventoryItemId: v.inventoryItemId || null,
    externalSource: "shopify",
    barcode: v.barcode ?? null,
    compareAtPrice: v.compareAtPrice ?? null,
    weight: v.weight ?? null,
    weightUnit: v.weightUnit ?? null,
    taxable: v.taxable ?? null,
    requiresShipping: v.requiresShipping ?? null,
    position: v.position ?? null,
    options: Array.isArray(v.options) ? v.options : [],
    imageUrl: v.image ?? null,
    externalCreatedAt: v.createdAt ? new Date(v.createdAt) : null,
    externalUpdatedAt: v.updatedAt ? new Date(v.updatedAt) : null,
  };
}

// Reconciles a product's full variant set by Shopify Variant GID:
//  • identity match → update  • legacy sku match → backfill GID + update
//  • no match → create        • locally-present-but-gone → deactivate
export async function reconcileVariants(productId: number, variants: any[]): Promise<number> {
  const existing = await prisma.productvariant.findMany({
    where: { productId },
    select: { id: true, sku: true, externalVariantId: true },
  });

  const byGid = new Map<string, number>();
  const legacyByKey = new Map<string, number>();
  for (const r of existing) {
    if (r.externalVariantId) byGid.set(r.externalVariantId, r.id);
    else legacyByKey.set(r.sku, r.id); // rows with no GID yet (pre-2.6)
  }

  const seen = new Set<number>();
  let created = 0;
  let backfilled = 0;

  for (const v of variants) {
    const data = buildVariantData(v);
    let rowId: number | null = null;
    let didBackfill = false;

    if (v.externalVariantId && byGid.has(v.externalVariantId)) {
      rowId = byGid.get(v.externalVariantId)!; // stable identity match
    } else {
      const legacyId = legacyByKey.get(variantMatchKey(v.sku, v.externalVariantId));
      if (legacyId != null) {
        rowId = legacyId; // migrate legacy row → attach GID
        didBackfill = true;
      }
    }

    if (rowId != null) {
      await prisma.productvariant.update({ where: { id: rowId }, data });
      seen.add(rowId);
      if (didBackfill) {
        backfilled++;
        syncLog("variant.backfill", { productId, variant: data.externalVariantId });
      } else {
        syncLog("variant.updated", { productId, variant: data.externalVariantId });
      }
    } else {
      const row = await prisma.productvariant.create({ data: { productId, ...data } });
      seen.add(row.id);
      created++;
      syncLog("variant.created", { productId, variant: data.externalVariantId });
    }
  }

  const stale = existing.filter((r) => !seen.has(r.id)).map((r) => r.id);
  if (stale.length) {
    await prisma.productvariant.updateMany({
      where: { id: { in: stale } },
      data: { isActive: false, stock: 0 },
    });
    syncLog("variant.deactivated", { productId, count: stale.length });
  }

  syncLog("variant.reconciled", {
    productId,
    incoming: variants.length,
    created,
    backfilled,
    deactivated: stale.length,
  });
  return variants.length;
}
