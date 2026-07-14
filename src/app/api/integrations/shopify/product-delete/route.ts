import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyInternalSecret, resolveSellerByShop } from "@/lib/helpers/internalAuth";

// products/delete webhook → soft-delete (deactivate) the product. Idempotent.
export async function POST(req: Request) {
  if (!verifyInternalSecret(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { shop, externalProductId } = await req.json();
  if (!shop || !externalProductId) {
    return NextResponse.json({ message: "shop and externalProductId are required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json({ message: `No seller linked to shop ${shop}` }, { status: 404 });
  }

  // Deactivate the product and every associated variant.
  const targets = await prisma.products.findMany({
    where: { sellerId: seller.id, externalProductId },
    select: { id: true },
  });

  const result = await prisma.products.updateMany({
    where: { sellerId: seller.id, externalProductId },
    data: { active: false, isDeleted: true },
  });

  if (targets.length) {
    await prisma.productvariant.updateMany({
      where: { productId: { in: targets.map((p) => p.id) } },
      data: { isActive: false },
    });
  }

  return NextResponse.json({ success: true, updated: result.count });
}

