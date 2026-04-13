import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.role?.name?.toLowerCase() !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const platformSettings = await prisma.platformSettings.findFirst({
            where: { id: 1 }
        });

        return NextResponse.json({
            success: true,
            data: platformSettings,
        });

    } catch (error) {
        console.error("GET Platform Commission Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.role?.name?.toLowerCase() !== "admin") {
            return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
        }

        const body = await req.json();

        // Map UI field 'commission' to DB field 'CommissionValue' if present
        const dataToUpdate = {
            defaultCommissionValue: typeof body.commission === 'number' ? body.commission : body.defaultCommissionValue
        };

        const updated = await prisma.platformSettings.upsert({
            where: { id: 1 },
            update: dataToUpdate,
            create: {
                id: 1,
                ...dataToUpdate,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Platform commission updated",
            data: updated,
        });

    } catch (error) {
        console.error("PUT Platform Commission Error:", error);
        return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
    }
}
