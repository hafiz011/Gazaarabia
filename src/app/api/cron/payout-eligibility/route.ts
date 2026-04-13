import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * CRON JOB: Update Payout Eligibility
 * This job finds all order items that have passed their cooling period (payoutEligibleAt)
 * and marks them as eligible for payout.
 * 
 * Frequency: Run daily
 */
export async function GET() {
  try {
    const now = new Date();

    // 1. Find and update eligible order items
    // Step 1a: Get IDs of all 'paid' orders (workaround for Prisma updateMany limitation)
    const paidOrders = await prisma.orders.findMany({
      where: { status: "paid" },
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
