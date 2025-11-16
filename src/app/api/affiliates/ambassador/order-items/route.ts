import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        // Validate Auth
        const userId = await checkAuth(req);
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

        // Check if user is affiliate/ambassador
        const user = await prisma.users.findUnique({
            where: { id: Number(userId) },
            include: {
                affiliate: true,
            },
        });

        if (!user || !user.affiliate) {
            return NextResponse.json({ success: false, message: "Affiliate profile not found" }, { status: 403 });
        }

        // Ambassador only fetch
        if (user.affiliate.type !== "ambassador") {
            return NextResponse.json(
                { success: false, message: "Only ambassadors can access this section" },
                { status: 403 }
            );
        }

        // Fetch Ambassador Order Items
        const orderItems = await prisma.orderItem.findMany({
            where: {
                ambassadorId: user.affiliate.id,
            },
            include: {
                product: {
                    select: {
                        title: true,
                        productimage: { select: { url: true }, take: 1 },
                    },
                },
                variant: {
                    select: {
                        sku: true,
                        color: { select: { name: true } },
                        size: { select: { name: true } },
                    },
                },
                order: {
                    select: {
                        id: true,
                        createdAt: true,
                        status: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ success: true, data: orderItems });
    } catch (error) {
        console.error("Ambassador Order Items Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}
