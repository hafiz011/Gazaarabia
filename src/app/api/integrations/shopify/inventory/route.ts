import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret, resolveSellerByShop } from "@/lib/helpers/internalAuth";
import { syncLog } from "@/lib/helpers/syncLog";

// inventory_levels/update → set the on-hand quantity of the AFFECTED variant,
// matched by Shopify Variant GID (or inventory item id) — NEVER by SKU. Absolute
// set → increases/decreases/adjustments and duplicate deliveries are idempotent.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop, externalProductId, externalVariantId, inventoryItemId, available } = await req.json();
  if (!shop || available == null || (!externalVariantId && !inventoryItemId)) {
    return NextResponse.json(
      { message: "shop, available and (externalVariantId or inventoryItemId) are required" },
      { status: 400 }
    );
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json({ message: `No seller linked to shop ${shop}` }, { status: 404 });
  }

  const qty = Math.max(0, Math.trunc(Number(available) || 0));

  // Resolve the parent product (for scoping + aggregate refresh) when we can.
  let productId: number | null = null;
  if (externalProductId) {
    const product = await prisma.products.findFirst({
      where: { sellerId: seller.id, externalProductId },
      select: { id: true },
    });
    productId = product?.id ?? null;
    // Product not synced yet — the next product sync will populate it.
    if (!productId) return NextResponse.json({ success: true, updated: 0 });
  }

  // Match by identity only (all globally-unique Shopify GIDs) — scalar filters.
  const where: any =
    productId != null && externalVariantId
      ? { productId, externalVariantId }
      : externalVariantId
        ? { externalVariantId }
        : { inventoryItemId };

  const vres = await prisma.productvariant.updateMany({ where, data: { stock: qty } });

  // Keep the product-level quantity in sync (sum of active variants).
  if (productId != null) {
    const agg = await prisma.productvariant.aggregate({
      where: { productId, isActive: true },
      _sum: { stock: true },
    });
    await prisma.products.update({
      where: { id: productId },
      data: { baseQty: agg._sum.stock ?? qty },
    });
  }

  syncLog("inventory.updated", {
    shop,
    variant: externalVariantId ?? inventoryItemId,
    qty,
    updated: vres.count,
  });
  return NextResponse.json({ success: true, updated: vres.count, qty });
}
