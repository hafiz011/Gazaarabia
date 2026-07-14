import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardInternal, resolveSellerByShop } from "@/lib/helpers/internalAuth";
import { syncLog } from "@/lib/helpers/syncLog";

// Order-push worker callback: persists the Shopify order mapping onto this
// seller's items for the marketplace order. Idempotent (only sets null ones).
export async function POST(req: Request) {
  const blocked = await guardInternal(req, "order-mapped");
  if (blocked) return blocked;

  const { shop, gazaOrderId, shopifyOrderGid, orderNumber, orderName, financialStatus } = await req.json();
  if (!shop || !gazaOrderId || !shopifyOrderGid) {
    return NextResponse.json({ message: "shop, gazaOrderId and shopifyOrderGid are required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json({ message: `No seller linked to shop ${shop}` }, { status: 404 });
  }

  const numeric = orderNumber ?? String(shopifyOrderGid).split("/").pop();

  const result = await prisma.orderItem.updateMany({
    where: { sellerId: seller.id, orderId: Number(gazaOrderId), externalOrderId: null },
    data: {
      externalOrderId: numeric,
      externalOrderName: orderName ?? null,
      externalFinancialStatus: financialStatus ?? null,
      externalSyncedAt: new Date(),
    },
  });

  syncLog("order.mapped", { shop, gazaOrderId, gid: shopifyOrderGid, updated: result.count });
  return NextResponse.json({ success: true, updated: result.count });
}
