import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { pushExternalItemsForOrder } from "@/lib/orderPush";

// Statuses that represent a confirmed payment (mirrors PAID_STATUSES in orderPush).
const PAID = ["paid", "succeeded", "processing", "confirmed", "shipped", "delivered"];

/**
 * CRON: durable Shopify/Woo push worker + retry backstop.
 *
 * The webhook (and PayPal checkout) only MARK an order paid, then fire the push
 * non-blocking. This job is the durable executor that guarantees every
 * SERVER-VERIFIED paid order whose external items are still un-pushed
 * (externalOrderId IS NULL) eventually reaches Shopify — even if the inline push
 * was lost to a crash/timeout.
 *
 * Safe to run on any interval (recommended: every 1 minute). Every push is
 * idempotent (Gaza externalOrderId guard + claim-first OrderMap), so concurrent
 * or repeated runs can never create a duplicate Shopify order.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Paid orders that still have at least one un-pushed external-store item.
  const orders = await prisma.orders.findMany({
    where: {
      status: { in: PAID },
      orderItems: {
        some: { externalOrderId: null, product: { isExternalProduct: true } },
      },
    },
    select: { id: true },
    take: 100,
    orderBy: { id: "asc" },
  });

  let pushed = 0;
  const errors: { orderId: number; error: string }[] = [];
  for (const { id } of orders) {
    try {
      await pushExternalItemsForOrder(id);
      pushed++;
    } catch (e) {
      errors.push({ orderId: id, error: (e as Error).message });
    }
  }

  return NextResponse.json({ scanned: orders.length, pushed, errors });
}
