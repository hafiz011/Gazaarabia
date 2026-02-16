import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const settings = await prisma.deliverySettings.findUnique({ where: { id: 1 } });

        return NextResponse.json({
            success: true,
            data: settings,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Error fetching delivery settings" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const userId = await checkAuth(req);
        if (!userId)
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || !user.role || user.role.name.toLowerCase() !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }


        const body = await req.json();

        const updated = await prisma.deliverySettings.upsert({
            where: { id: 1 },
            update: body,
            create: {
                id: 1,
                ...body,
            },
        });


        return NextResponse.json({
            success: true,
            message: "Delivery settings updated",
            data: updated,
        });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Error updating settings" }, { status: 500 });
    }
}
