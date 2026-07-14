import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { guardInternal, resolveSellerByShop } from "@/lib/helpers/internalAuth";
import { syncLog } from "@/lib/helpers/syncLog";

// Derive a marketplace item fulfillment status from the Shopify webhook. Only
// returns a value when there's a clear signal, so idempotent re-deliveries and
// unrelated events never clobber an existing status.
function mapFulfillment(
  topic: string,
  fulfillmentStatus: string | null,
  cancelledAt: string | null
): string | null {
  if (topic === "orders/cancelled" || cancelledAt) return "cancelled";
  if (topic === "orders/fulfilled" || fulfillmentStatus === "fulfilled") return "fulfilled";
  if (topic === "orders/partially_fulfilled" || fulfillmentStatus === "partial") {
    return "partially_fulfilled";
  }
  return null;
}

// Receives HMAC-verified order webhooks (forwarded by the Shopify app) and updates
// the mapped order items — item-level, seller-scoped, idempotent.
export async function POST(req: Request) {
  const blocked = await guardInternal(req, "order-status");
  if (blocked) return blocked;

  const body = await req.json();
  const { shop, topic, externalOrderId, orderName, financialStatus, fulfillmentStatus, cancelledAt, tracking, deleted } =
    body;
  if (!shop || !externalOrderId) {
    return NextResponse.json({ message: "shop and externalOrderId are required" }, { status: 400 });
  }

  const seller = await resolveSellerByShop(shop);
  if (!seller) {
    return NextResponse.json({ message: `No seller linked to shop ${shop}` }, { status: 404 });
  }

  // externalOrderId may arrive numeric or as a gid, so match both forms.
  const raw = String(externalOrderId);
  const numeric = raw.replace(/\D/g, "");
  const candidates = Array.from(
    new Set([raw, numeric, `gid://shopify/Order/${numeric}`].filter(Boolean))
  );

  const data: any = { externalSyncedAt: new Date() };

  if (deleted) {
    data.fulfillmentStatus = "deleted";
  } else {
    const fs = mapFulfillment(topic ?? "", fulfillmentStatus ?? null, cancelledAt ?? null);
    if (fs) data.fulfillmentStatus = fs;
    if (financialStatus) data.externalFinancialStatus = financialStatus;
    if (orderName) data.externalOrderName = orderName;
    if (tracking) {
      data.trackingNumber = tracking.number ?? null;
      data.trackingCompany = tracking.company ?? null;
      data.trackingUrl = tracking.url ?? null;
    }
  }

  const result = await prisma.orderItem.updateMany({
    where: { sellerId: seller.id, externalOrderId: { in: candidates } },
    data,
  });

  syncLog("webhook.processed", { shop, topic: topic ?? (deleted ? "orders/delete" : "?"), updated: result.count });
  return NextResponse.json({ success: true, updated: result.count });
}
