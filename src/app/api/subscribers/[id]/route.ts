import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/* -------------------------------------------------------
   GET → Fetch a single subscriber
-------------------------------------------------------- */
export async function GET(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const subscriber = await prisma.subscriber.findUnique({
            where: { id: Number(params.id) },
        });

        if (!subscriber) {
            return NextResponse.json(
                { success: false, message: "Subscriber not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: subscriber });
    } catch (error) {
        console.error("GET Subscriber Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch subscriber" },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------
   PUT → Update a subscriber
-------------------------------------------------------- */
export async function PUT(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { name, phone, isActive } = await req.json();

        const subscriber = await prisma.subscriber.update({
            where: { id: Number(params.id) },
            data: {
                name: name || null,
                phone: phone || null,
                isActive: typeof isActive === "boolean" ? isActive : undefined,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Subscriber updated successfully",
            data: subscriber,
        });
    } catch (error) {
        console.error("UPDATE Subscriber Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update subscriber" },
            { status: 500 }
        );
    }
}

/* -------------------------------------------------------
   DELETE → Remove a subscriber
-------------------------------------------------------- */
export async function DELETE(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        await prisma.subscriber.delete({
            where: { id: Number(params.id) },
        });

        return NextResponse.json({
            success: true,
            message: "Subscriber deleted successfully",
        });
    } catch (error) {
        console.error("DELETE Subscriber Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete subscriber" },
            { status: 500 }
        );
    }
}
