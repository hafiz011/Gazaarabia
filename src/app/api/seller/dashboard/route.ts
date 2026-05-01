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

        try {
            const [
                productsCount,
                ordersCount,
                recentOrders,
                topProducts,
                lowStockCount,
                reviewsCount,
            ] = await Promise.all([
                prisma.products.count({ where: { sellerId: seller.id } }),
                prisma.orders.count({
                    where: {
                        orderItems: { some: { sellerId: seller.id } }
                    }
                }),
                prisma.orders.findMany({
                    where: { orderItems: { some: { sellerId: seller.id } } },
                    orderBy: { createdAt: "desc" },
                    take: 5,
                    include: {
                        orderItems: {
                            where: { sellerId: seller.id },
                            select: {
                                quantity: true,
                                price: true,
                                title: true,
                            }
                        }
                    }
                }),
                prisma.products.findMany({
                    where: { sellerId: seller.id },
                    orderBy: { orderItems: { _count: "desc" } },
                    take: 5,
                    select: {
                        id: true,
                        title: true,
                        sellingPrice: true,
                        _count: { select: { orderItems: true } }
                    }
                }),
                prisma.productvariant.count({
                    where: {
                        products: { sellerId: seller.id },
                        stock: { lte: 5 }
                    }
                }),
                prisma.review.count({
                    where: { product: { sellerId: seller.id } }
                })
            ]);

            /* ================= ORDERS OVER TIME ================= */
            const ordersOverTimeRaw = await prisma.orders.findMany({
                where: {
                    orderItems: { some: { sellerId: seller.id } }
                },
                select: { createdAt: true },
                orderBy: { createdAt: "asc" },
            });

            const ordersOverTime = ordersOverTimeRaw.reduce((acc: any, item) => {
                const date = item.createdAt.toISOString().split("T")[0];
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

            /* ================= REVENUE OVER TIME ================= */
            const revenueOverTimeRaw = await prisma.orderItem.findMany({
                where: {
                    sellerId: seller.id,
                    order: { status: "paid" }
                },
                select: {
                    createdAt: true,
                    sellerEarning: true,
                },
                orderBy: { createdAt: "asc" },
            });

            const revenueOverTime = revenueOverTimeRaw.reduce((acc: any, item) => {
                const date = item.createdAt.toISOString().split("T")[0];
                acc[date] = (acc[date] || 0) + item.sellerEarning;
                return acc;
            }, {});


            /* ================= ORDER STATUS ================= */
            const orderStatusRaw = await prisma.orders.findMany({
                where: {
                    orderItems: { some: { sellerId: seller.id } }
                },
                select: { status: true },
            });

            const orderStatusMap = orderStatusRaw.reduce((acc: any, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
            }, {});

            const orderStatus = Object.entries(orderStatusMap).map(([status, count]) => ({
                status,
                _count: { id: count }
            }));

            // Calculate total revenue from order items
            const totalRevenue = revenueOverTimeRaw.reduce((sum, item) => sum + item.sellerEarning, 0);
            const avgOrderValue = ordersCount > 0 ? totalRevenue / ordersCount : 0;

            return NextResponse.json({
                products: productsCount,
                orders: ordersCount,
                revenue: totalRevenue,
                avgOrderValue: Number(avgOrderValue.toFixed(2)),
                lowStock: lowStockCount,
                reviews: reviewsCount,
                recentOrders: recentOrders.map(order => ({
                    id: order.id,
                    total: order.totalAmount,
                    status: order.status,
                    createdAt: order.createdAt,
                    customer: order.firstName + " " + order.lastName,
                    itemsCount: order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
                })),
                topProducts: topProducts.map(p => ({
                    id: p.id,
                    title: p.title,
                    price: p.sellingPrice,
                    salesCount: p._count.orderItems
                })),
                balances: {
                    available: seller.availableBalance,
                    pending: seller.pendingBalance,
                    totalEarned: seller.totalEarned,
                },
                charts: {
                    ordersOverTime,
                    revenueOverTime,
                    orderStatus,
                },
            });
        } catch (error) {
            console.error("DASHBOARD API ERROR:", error);
            return NextResponse.json(
            { error: "Failed to fetch dashboard data" },
            { status: 500 }
            );
        }
    } catch (error) {
        console.error("AUTH ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
