import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

// GET: Fetch seller's own payout dashboard data
export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const seller = await prisma.seller.findUnique({
        where: { userId: userId },
    });

    if (!seller) {
        return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404 });
    }

    try {
        // 1. Pending Balance
        const pendingQuery = await prisma.orderItem.aggregate({
            where: {
                sellerId: seller.id,
                isPaidOut: false,
                isPayoutEligible: false,
                order: { status: "paid" }
            },
            _sum: { sellerEarning: true }
        });

        // 2. Available Balance
        const availableQuery = await prisma.orderItem.aggregate({
            where: {
                sellerId: seller.id,
                isPaidOut: false,
                isPayoutEligible: true,
                order: { status: "paid" }
            },
            _sum: { sellerEarning: true }
        });

        // 3. Refunds
        const refundsQuery = await prisma.orderItem.aggregate({
            where: {
                sellerId: seller.id,
                refundedAmount: { gt: 0 }
            },
            _sum: { refundedAmount: true }
        });

        // 4. Total Paid History
        const totalPaidQuery = await prisma.sellerPayout.aggregate({
            where: { sellerId: seller.id, status: "paid" },
            _sum: { amount: true }
        });

        // 5. Recent Earnings (Order Items)
        const recentEarnings = await prisma.orderItem.findMany({
            where: {
                sellerId: seller.id,
                order: { status: "paid" }
            },
            select: {
                id: true,
                subtotal: true,
                sellerEarning: true,
                createdAt: true,
                payoutEligibleAt: true,
                isPayoutEligible: true,
                isPaidOut: true,
                product: { select: { title: true } }
            },
            orderBy: { createdAt: "desc" },
            take: 20
        });

        // 6. Payout History
        const payoutHistory = await prisma.sellerPayout.findMany({
            where: { sellerId: seller.id },
            orderBy: { createdAt: "desc" },
            take: 10
        });

        const pending = pendingQuery._sum.sellerEarning || 0;
        const available = (availableQuery._sum.sellerEarning || 0) - (refundsQuery._sum.refundedAmount || 0);
        const totalPaid = totalPaidQuery._sum.amount || 0;

        return NextResponse.json({
            success: true,
            data: {
                balances: {
                    pending,
                    available: Math.max(available, -10000),
                    totalPaid,
                    minimumPayout: seller.minimumPayout
                },
                recentEarnings,
                payoutHistory
            }
        });

    } catch (error) {
        console.error("Seller Payouts GET Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
