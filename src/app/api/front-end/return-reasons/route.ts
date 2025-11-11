import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// GET - Only Logged-in Users
export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);

    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized - Login required" },
            { status: 401 }
        );
    }

    try {
        const reasons = await prisma.returnReason.findMany({
            where: { isActive: true },
            select: {
                id: true,
                label: true,
                requireImage: true,
            },
            orderBy: { id: "asc" },
        });

        return NextResponse.json({ success: true, data: reasons }, { status: 200 });
    } catch (error) {
        console.error("GET Return Reasons Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch return reasons." },
            { status: 500 }
        );
    }
}
