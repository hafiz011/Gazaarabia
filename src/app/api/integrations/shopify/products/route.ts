import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardInternal, resolveSellerByShop } from "@/lib/helpers/internalAuth";
import { reconcileVariants } from "@/lib/services/shopifyVariantSync";

// Receives a merchant's catalog pushed by the Shopify app and upserts it into
// gazaarabia. Mirrors the WooCommerce sync: keyed on (sellerId, externalProductId).
export async function POST(req: Request) {
  const blocked = await guardInternal(req, "products", 600);
  if (blocked) return blocked;

  const { shop, products } = await req.json();
  if (!shop || !Array.isArray(products)) {
    return NextResponse.json({ message: "shop and products[] are required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json(
      { message: `No gazaarabia seller is linked to shop ${shop}` },
      { status: 404 }
    );
  }

  let imported = 0;
  let skipped = 0;

  for (const p of products) {
    try {
      if (!p.externalProductId) {
        skipped++;
        continue;
      }

      // Shopify ids are globally unique, so a slug built from the numeric id is
      // guaranteed unique (products.slug is @unique).
      const numericId = String(p.externalProductId).split("/").pop() ?? "";
      const base = String(p.slug || p.title || "product")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const slug = `${base}-${numericId}`;

      const saved = await prisma.products.upsert({
        where: {
          sellerId_externalProductId: {
            sellerId: seller.id,
            externalProductId: p.externalProductId,
          },
        },
        update: {
          title: p.title,
          description: p.description ?? null,
          sellingPrice: p.sellingPrice ?? 0,
          costPrice: p.costPrice ?? 0,
          baseQty: p.baseQty ?? 0,
          updatedAt: new Date(),
        },
        create: {
          sellerId: seller.id,
          title: p.title,
          slug,
          description: p.description ?? null,
          sellingPrice: p.sellingPrice ?? 0,
          costPrice: p.costPrice ?? 0,
          baseQty: p.baseQty ?? 0,
          externalProductId: p.externalProductId,
          externalVariantId: p.externalVariantId ?? null,
          externalSource: "shopify",
          isExternalProduct: true,
          commissionValue: seller.commissionValue,
          active: true,
        },
      });

      if (p.image) {
        const existing = await prisma.productimage.findFirst({
          where: { productId: saved.id, primary: true },
        });
        if (!existing) {
          await prisma.productimage.create({
            data: { url: p.image, alt: p.title, primary: true, productId: saved.id },
          });
        }
      }

      // Sync the full variant set (add new, update changed, deactivate removed).
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        await reconcileVariants(saved.id, p.variants);
      }

      imported++;
    } catch (e) {
      console.error("Shopify product upsert skipped:", (e as Error).message);
      skipped++;
    }
  }

  // Note: lastSyncedAt is NOT bumped here (this endpoint receives per-page chunks
  // and single-product webhook writes). The full-sync watermark is set once, to
  // the sync's start time, by /api/integrations/shopify/sync-complete.
  return NextResponse.json({ success: true, imported, skipped });
}
