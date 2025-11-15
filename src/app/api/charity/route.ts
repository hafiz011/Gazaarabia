import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

// GET — List all charity donations
export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId)
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    const allowedRoles = ["admin"];

    if (!user || !allowedRoles.includes(user.role.name.toLowerCase()))
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    try {
        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search")?.toLowerCase() || "";

        const where = search
            ? {
                OR: [
                    { email: { contains: search } },
                    { name: { contains: search } },
                    { transactionId: { contains: search } },
                    { id: Number(search) || undefined }
                ],
            }
            : {};

        const donations = await prisma.charityDonations.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, donations });
    } catch (error) {
        console.error("GET Charity Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch donations" },
            { status: 500 }
        );
    }
}
