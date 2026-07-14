import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret, resolveSellerByShop } from "@/lib/helpers/internalAuth";

// Called by the Shopify app when a full/delta sync finishes. Advances the sync
// watermark (only on success, to the sync's START time so the next delta can't
// miss mid-run changes) and records an audit row in the existing StoreSync table.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop, syncedAt, status, imported, skipped, error, syncType } = await req.json();
  if (!shop) {
    return NextResponse.json({ message: "shop is required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json({ message: `No seller linked to shop ${shop}` }, { status: 404 });
  }

  if (status === "success" && syncedAt) {
    await prisma.seller.update({
      where: { id: seller.id },
      data: { lastSyncedAt: new Date(syncedAt) },
    });
  }

  await prisma.storeSync.create({
    data: {
      sellerId: seller.id,
      status: status === "success" ? "success" : "failed",
      syncType: syncType || "shopify",
      imported: Number(imported) || 0,
      skipped: Number(skipped) || 0,
      error: error || null,
    },
  });

  return NextResponse.json({ success: true });
}
