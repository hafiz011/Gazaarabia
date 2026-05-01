import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        /* ================= AUTH ================= */
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.role?.name.toLowerCase() !== "seller") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: user.id },
        });

        if (!seller) {
            return NextResponse.json({ message: "Seller profile not found" }, { status: 404 });
        }

        /* ================= FETCH DATA ================= */

        // 1. Get recent earnings (Order Items)
        const recentEarnings = await prisma.orderItem.findMany({
            where: {
                product: { sellerId: seller.id },
                order: { status: 'paid' } // Only count paid orders
            },
            include: {
                product: {
                    select: { title: true }
                },
                order: {
                    select: { createdAt: true, id: true }
                }
            },
            orderBy: {
                order: { createdAt: 'desc' }
            },
            take: 20
        });

        // 2. Get daily earnings for chart (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyEarnings = await prisma.orderItem.findMany({
            where: {
                product: { sellerId: seller.id },
                order: {
                    status: 'paid',
                    createdAt: { gte: thirtyDaysAgo }
                }
            },
            select: {
                sellerEarning: true,
                order: {
                    select: { createdAt: true }
                }
            }
        });

        const chartDataMap: Record<string, number> = {};
        dailyEarnings.forEach(item => {
            const date = item.order.createdAt.toISOString().split('T')[0];
            chartDataMap[date] = (chartDataMap[date] || 0) + (item.sellerEarning || 0);
        });

        const chartData = Object.entries(chartDataMap).map(([date, amount]) => ({
            date,
            amount: Number(amount.toFixed(2))
        })).sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            balances: {
                available: seller.availableBalance || 0,
                pending: seller.pendingBalance || 0,
                totalEarned: seller.totalEarned || 0,
            },
            recentEarnings: recentEarnings.map(item => ({
                id: item.id,
                orderId: item.order.id,
                productTitle: item.product.title,
                amount: item.sellerEarning || 0,
                createdAt: item.order.createdAt,
            })),
            chartData
        });
    } catch (error) {
        console.error("SELLER EARNINGS API ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
