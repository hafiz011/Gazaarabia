import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    // Check admin
    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (user?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json(
            { success: false, message: "Forbidden" },
            { status: 403 }
        );
    }

    try {
        const { searchParams } = new URL(req.url);

        const search = searchParams.get("search") || "";
        const status = searchParams.get("status"); // active / pending
        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);

        const skip = (page - 1) * limit;

        const whereCondition: any = {
            AND: [
                search
                    ? {
                        OR: [
                            { shopName: { contains: search } },
                            {
                                user: {
                                    name: { contains: search },
                                },
                            },
                            {
                                user: {
                                    email: { contains: search },
                                },
                            },
                        ],
                    }
                    : {},
                status ? { status } : {},
            ],
        };

        const sellers = await prisma.seller.findMany({
            where: whereCondition,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                _count: {
                    select: {
                        products: true,
                        orderItems: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        });

        const total = await prisma.seller.count({
            where: whereCondition,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Sellers fetched successfully",
                data: sellers,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            },
            { status: 200 }
        );
    } catch (err) {
        console.error("GET Sellers Error:", err);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}