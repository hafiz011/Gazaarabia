import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId)
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    //  Check User Role
    const admin = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (admin?.role?.name?.toLowerCase() !== "admin")
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

    try {
        const requests = await prisma.returnRequest.findMany({
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
        });

        return NextResponse.json({ success: true, data: requests }, { status: 200 });
    } catch (err) {
        console.error("GET Return Requests Error:", err);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
