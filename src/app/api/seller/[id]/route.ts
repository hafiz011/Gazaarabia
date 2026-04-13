import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = await checkAuth(req);

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    // Check admin
    const admin = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (admin?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json(
            { success: false, message: "Forbidden" },
            { status: 403 }
        );
    }

    const sellerId = Number(id);

    try {
        // =========================================
        // 1. SELLER BASIC INFO
        // =========================================
        const seller = await prisma.seller.findUnique({
            where: { id: sellerId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
            },
        });

        if (!seller) {
            return NextResponse.json(
                { success: false, message: "Seller not found" },
                { status: 404 }
            );
        }

        // =========================================
        // 2. AGGREGATED STATS
        // =========================================
        const orderItems = await prisma.orderItem.findMany({
            where: { sellerId },
            select: {
                subtotal: true,
                sellerEarning: true,
                commissionAmount: true,
                quantity: true,
                createdAt: true,
            },
        });

        const totalOrders = new Set(
            await prisma.orderItem.findMany({
                where: { sellerId },
                select: { orderId: true },
            })
        ).size;

        const totalRevenue = orderItems.reduce(
            (sum, i) => sum + i.subtotal,
            0
        );

        const totalEarning = orderItems.reduce(
            (sum, i) => sum + i.sellerEarning,
            0
        );

        const totalCommission = orderItems.reduce(
            (sum, i) => sum + i.commissionAmount,
            0
        );

        const avgOrderValue =
            totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // =========================================
        // 3. PRODUCT STATS
        // =========================================
        const totalProducts = await prisma.products.count({
            where: { sellerId },
        });

        const topProducts = await prisma.orderItem.groupBy({
            by: ["productId"],
            where: { sellerId },
            _sum: { quantity: true, subtotal: true },
            orderBy: {
                _sum: {
                    subtotal: "desc",
                },
            },
            take: 5,
        });

        // =========================================
        // 4. RECENT ORDERS
        // =========================================
        const recentOrders = await prisma.orderItem.findMany({
            where: { sellerId },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        totalAmount: true,
                    },
                },
                product: {
                    select: { title: true },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        // =========================================
        // 5. PAYOUT DATA
        // =========================================
        const payouts = await prisma.sellerPayout.findMany({
            where: { sellerId },
        });

        const totalPaid = payouts
            .filter((p) => p.status === "paid")
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingPayout = payouts
            .filter((p) => p.status === "pending")
            .reduce((sum, p) => sum + p.amount, 0);

        // =========================================
        // 6. SALES TREND (LAST 7 DAYS)
        // =========================================
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const salesTrend = await prisma.orderItem.groupBy({
            by: ["createdAt"],
            where: {
                sellerId,
                createdAt: { gte: last7Days },
            },
            _sum: {
                subtotal: true,
            },
        });

        // =========================================
        // FINAL RESPONSE
        // =========================================
        return NextResponse.json({
            success: true,
            message: "Seller analytics fetched successfully",
            data: {
                seller,

                metrics: {
                    totalRevenue: Number(totalRevenue.toFixed(2)),
                    totalEarning: Number(totalEarning.toFixed(2)),
                    totalCommission: Number(totalCommission.toFixed(2)),
                    totalOrders,
                    totalProducts,
                    avgOrderValue: Number(avgOrderValue.toFixed(2)),
                },

                payouts: {
                    totalPaid,
                    pendingPayout,
                    currentBalance: seller.availableBalance,
                },

                topProducts,
                recentOrders,
                salesTrend,
            },
        });
    } catch (error) {
        console.error("Seller Details Error:", error);

        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userId = await checkAuth(req);

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    // Check admin
    const admin = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (admin?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json(
            { success: false, message: "Forbidden" },
            { status: 403 }
        );
    }

    const sellerId = Number(id);

    try {
        const body = await req.json();
        const { status, commissionValue } = body;

        const updateData: any = {};

        if (status) {
            if (status === "active") {
                updateData.isActive = true;
                updateData.status = "active";
            } else if (status === "suspended") {
                updateData.isActive = false;
                updateData.status = "suspended";
            } else {
                return NextResponse.json(
                    { success: false, message: "Invalid status" },
                    { status: 400 }
                );
            }
        }

        if (typeof commissionValue === "number") {
            if (commissionValue < 0 || commissionValue > 100) {
                return NextResponse.json(
                    { success: false, message: "Commission value must be between 0 and 100" },
                    { status: 400 }
                );
            }
            updateData.commissionValue = commissionValue;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { success: false, message: "No valid fields to update" },
                { status: 400 }
            );
        }

        const updatedSeller = await prisma.seller.update({
            where: { id: sellerId },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            message: `Seller updated successfully`,
            data: updatedSeller
        });

    } catch (error) {
        console.error("Update Seller Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}