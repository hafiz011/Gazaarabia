import { NextResponse } from "next/server";
import { verifyInternalSecret, resolveSellerByShop } from "@/lib/helpers/internalAuth";

// Internal (shared-secret) endpoint the Shopify app calls to check whether a
// shop is already linked to a Gazaarabia seller.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop } = await req.json();
  if (!shop) {
    return NextResponse.json({ message: "shop is required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  return NextResponse.json({
    linked: Boolean(seller),
    lastSyncedAt: seller?.lastSyncedAt ?? null,
  });
}
