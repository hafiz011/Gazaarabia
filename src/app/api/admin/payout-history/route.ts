import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const me = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (me?.role?.name?.toLowerCase() !== "admin") {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    try {
        const history = await prisma.sellerPayout.findMany({
            include: {
                seller: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({ success: true, data: history });
    } catch (error) {
        console.error("Payout History GET Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
