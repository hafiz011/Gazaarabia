import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ambassadors = await prisma.affiliate.findMany({
        where: { type: "ambassador", isActive: true },
        include: {
            user: true,
        },
        orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, data: ambassadors });
}
