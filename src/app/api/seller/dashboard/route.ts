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
                ordersCount
            ] = await Promise.all([
                prisma.products.count({ where: { sellerId: seller.id } }),
                prisma.orders.count({
                    where: {
                        orderItems: { some: { sellerId: seller.id } }
                    }
                }),
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





            return NextResponse.json({
                products: productsCount,
                orders: ordersCount,
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
