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

        try {
            const [
            deliveryOptions,
            products,
            orders
            ] = await Promise.all([
            prisma.deliveryOptions.count(),
            prisma.products.count(),
            prisma.orders.count(),
            ]);



            /* ================= ORDERS OVER TIME ================= */
            const ordersOverTimeRaw = await prisma.orders.findMany({
            select: { createdAt: true },
            orderBy: { createdAt: "asc" },
            });

            const ordersOverTime = ordersOverTimeRaw.reduce((acc: any, item) => {
            const date = item.createdAt.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
            }, {});

            /* ================= REVENUE OVER TIME ================= */
            const revenueOverTimeRaw = await prisma.orders.findMany({
            select: {
                createdAt: true,
                totalAmount: true,
            },
            orderBy: { createdAt: "asc" },
            });

            const revenueOverTime = revenueOverTimeRaw.reduce((acc: any, item) => {
            const date = item.createdAt.toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + item.totalAmount;
            return acc;
            }, {});


            /* ================= ORDER STATUS ================= */
            const orderStatus = await prisma.orders.groupBy({
            by: ["status"],
            _count: { id: true },
            });





            return NextResponse.json({
            deliveryOptions,
            products,
            orders,
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
