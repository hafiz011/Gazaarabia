import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: any) {
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
        const donation = await prisma.charityDonations.findUnique({
            where: { id: Number(params.id) },
            include: {
                order: {
                    include: {
                        user: true,
                        orderItems: true,
                    },
                },
            },
        });

        if (!donation) {
            return NextResponse.json(
                { success: false, message: "Donation not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, donation });
    } catch (error) {
        console.error("GET Donation Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch donation" },
            { status: 500 }
        );
    }
}
