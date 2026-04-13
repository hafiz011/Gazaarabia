import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

// GET: Fetch all sellers with calculated payout balances
export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (me?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        const sellers = await prisma.seller.findMany({
            include: { user: { select: { name: true, email: true } } }
        });

        // 1. Fetch performance-critical aggregate data for ALL sellers in bulk
        // We Use groupBy to avoid the N+1 problem (hundreds of queries in a loop)
        const [orderStats, refundStats, payoutStats] = await Promise.all([
            // Pending & Available Earnings
            prisma.orderItem.groupBy({
                by: ['sellerId', 'isPayoutEligible', 'isPaidOut'],
                where: { order: { status: "paid" } },
                _sum: { sellerEarning: true }
            }),
            // Deductions (Refunds)
            prisma.orderItem.groupBy({
                by: ['sellerId'],
                where: { refundedAmount: { gt: 0 } },
                _sum: { refundedAmount: true }
            }),
            // Total Paid History
            prisma.sellerPayout.groupBy({
                by: ['sellerId'],
                where: { status: "paid" },
                _sum: { amount: true }
            })
        ]);

        // 2. Map the results back to individual sellers with identical logic
        const payoutData = sellers.map(seller => {
            const stats = orderStats.filter(s => s.sellerId === seller.id);

            // Logic match: pending = !eligible && !paidOut
            const pending = stats
                .filter(s => !s.isPayoutEligible && !s.isPaidOut)
                .reduce((acc, curr) => acc + (Number(curr._sum.sellerEarning) || 0), 0);

            // Logic match: available = eligible && !paidOut
            const eligible = stats
                .filter(s => s.isPayoutEligible && !s.isPaidOut)
                .reduce((acc, curr) => acc + (Number(curr._sum.sellerEarning) || 0), 0);

            const refunds = Number(refundStats.find(s => s.sellerId === seller.id)?._sum.refundedAmount || 0);
            const totalPaid = Number(payoutStats.find(s => s.sellerId === seller.id)?._sum.amount || 0);

            // Calculation as per original logic
            const available = eligible - refunds;

            return {
                id: seller.id,
                shopName: seller.shopName || "Unnamed Shop",
                sellerName: seller.user?.name || "Unknown Seller",
                email: seller.user?.email || "No Email",
                pendingBalance: pending,
                availableBalance: Math.max(available, -10000), // Allow negative for debt tracking
                totalEarned: totalPaid,
                minimumPayout: seller.minimumPayout || 0
            };
        });

        return NextResponse.json({ success: true, data: payoutData });

    } catch (error) {
        console.error("Admin Payouts GET Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

// POST: Process a payout for a seller
export async function POST(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (me?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        const { sellerId, amount, paymentMethod, paymentRef, notes } = await req.json();

        if (!sellerId || !amount) {
            return NextResponse.json({ success: false, message: "Missing seller or amount" }, { status: 400 });
        }

        // 1. Create Payout Record
        const payout = await prisma.sellerPayout.create({
            data: {
                sellerId,
                amount: parseFloat(amount),
                paymentMethod,
                paymentRef,
                status: "paid",
                paidAt: new Date(),
                periodLabel: `Payout on ${new Date().toLocaleDateString()}`
            }
        });

        // 2. Mark all currently ELIGIBLE items as PAID OUT
        // This effectively 'settles' the balance up to this point

        // Step 2a: Get IDs of all 'paid' orders (workaround for Prisma updateMany limitation)
        const paidOrders = await prisma.orders.findMany({
            where: { status: "paid" },
            select: { id: true }
        });
        const paidOrderIds = paidOrders.map(o => o.id);

        await prisma.orderItem.updateMany({
            where: {
                sellerId,
                isPaidOut: false,
                isPayoutEligible: true,
                orderId: { in: paidOrderIds }
            },
            data: {
                isPaidOut: true
            }
        });

        // 3. Update Seller Balances in metadata (optional but good for cache)
        const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
        if (seller) {
            await prisma.seller.update({
                where: { id: sellerId },
                data: {
                    totalEarned: { increment: parseFloat(amount) },
                    availableBalance: { decrement: parseFloat(amount) }
                }
            });
        }

        return NextResponse.json({ success: true, message: "Payout processed successfully", data: payout });

    } catch (error) {
        console.error("Admin Payouts POST Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
