import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardInternal, resolveSellerByShop } from "@/lib/helpers/internalAuth";
import { syncLog } from "@/lib/helpers/syncLog";

// refunds/create (forwarded, HMAC-verified) → synchronize refund state onto the
// seller's items. Never recreates the order. Idempotent (absolute status set).
export async function POST(req: Request) {
  const blocked = await guardInternal(req, "refund");
  if (blocked) return blocked;

  const { shop, externalOrderId, amount, reason } = await req.json();
  if (!shop || !externalOrderId) {
    return NextResponse.json({ message: "shop and externalOrderId are required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json({ message: `No seller linked to shop ${shop}` }, { status: 404 });
  }

  const raw = String(externalOrderId);
  const numeric = raw.replace(/\D/g, "");
  const candidates = Array.from(
    new Set([raw, numeric, `gid://shopify/Order/${numeric}`].filter(Boolean))
  );

  const result = await prisma.orderItem.updateMany({
    where: { sellerId: seller.id, externalOrderId: { in: candidates } },
    data: {
      returnStatus: "refunded",
      externalFinancialStatus: "refunded",
      externalSyncedAt: new Date(),
    },
  });

  // NOTE: exact per-line refund amount attribution needs Shopify line-item → order
  // item mapping (deferred to M4). We record the total on the log for now.
  syncLog("refund.synchronized", { shop, orderId: numeric, amount, reason, updated: result.count });
  return NextResponse.json({ success: true, updated: result.count });
}
