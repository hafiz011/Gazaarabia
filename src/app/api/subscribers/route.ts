import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    const allowedRoles = ["admin"];

    if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.trim() || "";

        const where = search
            ? {
                OR: [
                    { email: { contains: search } },
                    { name: { contains: search } },
                    { phone: { contains: search } },
                ],
            }
            : {};

        const subscribers = await prisma.subscriber.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: subscribers });
    } catch (error) {
        console.error("GET subscriber Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch subscribers" },
            { status: 500 }
        );
    }
}
