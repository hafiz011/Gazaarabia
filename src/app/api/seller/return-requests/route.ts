import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId)
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    //  Check User Role
    const seller = await prisma.seller.findUnique({
        where: { userId: userId },
    });

    if (!seller) {
        return NextResponse.json({ success: false, message: "Seller profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    try {
        const [requests, total] = await Promise.all([
            prisma.returnRequest.findMany({
                where: {
                    orderItem: { sellerId: seller.id }
                },
                include: {
                    user: { select: { name: true, email: true } },
                    order: { select: { id: true } },
                    orderItem: {
                        select: {
                            product: { select: { title: true, productimage: { take: 1 } } },
                            quantity: true,
                            price: true,
                        },
                    },
                    reason: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.returnRequest.count({
                where: {
                    orderItem: { sellerId: seller.id }
                }
            })
        ]);

        return NextResponse.json({ 
            success: true, 
            data: requests,
            total,
            page,
            limit
        }, { status: 200 });
    } catch (err) {
        console.error("GET Return Requests Error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
