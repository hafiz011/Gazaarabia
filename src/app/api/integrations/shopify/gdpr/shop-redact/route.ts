import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret, resolveSellerByShop } from "@/lib/helpers/internalAuth";

// GDPR: fires 48h after a merchant uninstalls (SLA: purge all store data within
// 48h). Remove the store's synced products and clear the connection.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop, payload } = await req.json();
  if (!shop) {
    return NextResponse.json({ message: "shop is required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    // Nothing linked → nothing to purge.
    return NextResponse.json({ success: true, purged: 0 });
  }

  // Remove products synced from this Shopify store...
  const deleted = await prisma.products.deleteMany({
    where: { sellerId: seller.id, externalSource: "shopify" },
  });

  // ...and clear the store connection from the seller record.
  await prisma.seller.update({
    where: { id: seller.id },
    data: {
      storeType: null,
      shopifyDomain: null,
      shopifyAccessToken: null,
    },
  });

  console.log("[shopify][gdpr] shop_redact", { shop, deleted: deleted.count });

  return NextResponse.json({ success: true, purged: deleted.count });
}
