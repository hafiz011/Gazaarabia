import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CRON JOB: Update Payout Eligibility
 * This job finds all order items that have passed their cooling period (payoutEligibleAt)
 * and marks them as eligible for payout.
 * 
 * Frequency: Run daily
 */
export async function GET(req: NextRequest) {
  // Only the scheduler (holding CRON_SECRET) may flip payout eligibility
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Find and update eligible order items
    // Step 1a: Get IDs of all 'paid' orders (workaround for Prisma updateMany limitation)
    const paidOrders = await prisma.orders.findMany({
      where: { status: { in: ["succeeded", "paid", "processing", "shipped", "delivered"] } },
      select: { id: true }
    });
    const paidOrderIds = paidOrders.map(o => o.id);

    const updateResult = await prisma.orderItem.updateMany({
      where: {
        isPaidOut: false,
        isPayoutEligible: false,
        payoutEligibleAt: {
          lte: now
        },
        orderId: { in: paidOrderIds }
      },
      data: {
        isPayoutEligible: true
      }
    });

    return NextResponse.json({
      success: true,
      message: "Payout eligibility updated.",
      updatedCount: updateResult.count
    });

  } catch (error) {
    console.error("Cron Error (Payout Eligibility):", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update payout eligibility."
    }, { status: 500 });
  }
}
