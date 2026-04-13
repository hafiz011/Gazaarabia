import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check admin
    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (user?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const startDateParam = searchParams.get("startDate");
        const endDateParam = searchParams.get("endDate");

        const where: any = {};
        if (startDateParam || endDateParam) {
            where.createdAt = {};
            if (startDateParam) where.createdAt.gte = new Date(startDateParam);
            if (endDateParam) where.createdAt.lte = new Date(endDateParam);
        }

        // 1. KPI Aggregation
        const kpis = await prisma.orderItem.aggregate({
            where,
            _sum: {
                subtotal: true,
                commissionAmount: true,
                sellerEarning: true,
                affiliateEarning: true,
                ambassadorEarning: true,
            },
            _count: {
                id: true
            }
        });

        const totalCharity = await prisma.orders.aggregate({
            where,
            _sum: {
                charityAmount: true
            }
        });

        // 2. Trend Data (Daily)
        // Note: For complex date grouping in MySQL, we might use queryRaw, 
        // but for now let's try to get all items and group in JS if the volume is manageable, 
        // or use a more efficient groupBy if supported for dates.
        const orderItems = await prisma.orderItem.findMany({
            where,
            select: {
                subtotal: true,
                commissionAmount: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        const trend: Record<string, { date: string, revenue: number, profit: number }> = {};
        orderItems.forEach(item => {
            const dateStr = item.createdAt.toISOString().split('T')[0];
            if (!trend[dateStr]) {
                trend[dateStr] = { date: dateStr, revenue: 0, profit: 0 };
            }
            trend[dateStr].revenue += item.subtotal;
            trend[dateStr].profit += item.commissionAmount;
        });

        // 3. Seller Breakdown
        const sellerStats = await prisma.orderItem.groupBy({
            where,
            by: ['sellerId'],
            _sum: {
                subtotal: true,
                commissionAmount: true
            },
            orderBy: {
                _sum: {
                    subtotal: 'desc'
                }
            },
            take: 10
        });

        const sellers = await prisma.seller.findMany({
            where: {
                id: { in: sellerStats.map(s => s.sellerId) }
            },
            select: {
                id: true,
                shopName: true
            }
        });

        const sellerBreakdown = sellerStats.map(s => {
            const seller = sellers.find(sel => sel.id === s.sellerId);
            return {
                sellerName: seller?.shopName || `Seller #${s.sellerId}`,
                revenue: s._sum.subtotal || 0,
                profit: s._sum.commissionAmount || 0
            };
        });

        // 4. Category Breakdown
        // We need to join with products to get category
        const itemsWithProducts = await prisma.orderItem.findMany({
            where,
            include: {
                product: {
                    include: {
                        categories: true
                    }
                }
            }
        });

        const categoryTrend: Record<string, { name: string, value: number }> = {};
        itemsWithProducts.forEach(item => {
            const catName = item.product?.categories?.name || "Uncategorized";
            if (!categoryTrend[catName]) {
                categoryTrend[catName] = { name: catName, value: 0 };
            }
            categoryTrend[catName].value += item.subtotal;
        });

        // 5. Top Products Breakdown
        const productStats = await prisma.orderItem.groupBy({
            where,
            by: ['productId'],
            _sum: {
                subtotal: true,
                quantity: true
            },
            orderBy: {
                _sum: {
                    subtotal: 'desc'
                }
            },
            take: 10
        });

        const products = await prisma.products.findMany({
            where: {
                id: { in: productStats.map(p => p.productId) }
            },
            include: {
                productimage: {
                    where: { primary: true },
                    take: 1
                }
            }
        });

        const topProducts = productStats.map(p => {
            const product = products.find(prod => prod.id === p.productId);
            // Get primary image or first image
            const thumbnail = product?.productimage?.[0]?.url;

            return {
                id: p.productId,
                name: product?.title || `Product #${p.productId}`,
                thumbnail: thumbnail,
                revenue: p._sum.subtotal || 0,
                quantity: p._sum.quantity || 0
            };
        });

        const totalRevenue = kpis._sum.subtotal || 0;
        const totalProfit = kpis._sum.commissionAmount || 0;

        return NextResponse.json({
            success: true,
            data: {
                kpis: {
                    totalRevenue,
                    totalProfit,
                    totalSellerEarning: kpis._sum.sellerEarning || 0,
                    totalAffiliateEarning: kpis._sum.affiliateEarning || 0,
                    totalAmbassadorEarning: kpis._sum.ambassadorEarning || 0,
                    totalCharity: totalCharity._sum.charityAmount || 0,
                    orderCount: kpis._count.id || 0,
                    aov: kpis._count.id > 0 ? totalRevenue / kpis._count.id : 0,
                    avgProfitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
                },
                revenueTrend: Object.values(trend),
                sellerBreakdown,
                categoryBreakdown: Object.values(categoryTrend),
                topProducts
            }
        });

    } catch (error) {
        console.error("Revenue Breakdown Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
