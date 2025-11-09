import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.role?.name.toLowerCase() !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const settings = await prisma.homePageSetting.findFirst();
        return NextResponse.json({ success: true, data: settings || {} });

    } catch (error) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token: any = getTokenFromHeader(req);
        const adminId = getUserIdFromToken(token);

        if (!adminId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const admin = await prisma.users.findUnique({
            where: { id: adminId },
            include: { role: true },
        });

        if (!admin || admin.role.name.toLowerCase() !== "admin")
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { heroSlides, shopByCategory, midBanner, signatureProducts, headerText } = body;

        const updated = await prisma.homePageSetting.upsert({
            where: { id: 1 }, // If the row doesn't exist, this triggers CREATE
            update: {
                heroSlides,
                shopByCategory,
                midBanner,
                signatureProducts,
                headerText,
            },
            create: {
                id: 1,
                heroSlides,
                shopByCategory,
                midBanner,
                signatureProducts,
                headerText,
            },
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("HOMEPAGE SAVE ERROR:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
