// app/api/solidarity-receipts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// --------------------------------------------------
// GET - Get Receipt by ID
// --------------------------------------------------
export async function GET(req: NextRequest, context: any) {
    const params = await context.params;          // MUST AWAIT
    const id = Number(params.id);

    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const receipt = await prisma.solidarityReceipts.findUnique({
        where: { id },
    });

    if (!receipt) {
        return NextResponse.json(
            { success: false, message: "Receipt not found" },
            { status: 404 }
        );
    }

    return NextResponse.json({ success: true, data: receipt });
}

// --------------------------------------------------
// PUT - Update Receipt
// --------------------------------------------------
export async function PUT(req: NextRequest, context: any) {
    const params = await context.params;
    const id = Number(params.id);

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
        const body = await req.json();

        const updated = await prisma.solidarityReceipts.update({
            where: { id },
            data: body,
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Failed to update receipt." },
            { status: 500 }
        );
    }
}

// --------------------------------------------------
// DELETE - Delete Receipt
// --------------------------------------------------
export async function DELETE(req: NextRequest, context: any) {
    const params = await context.params;
    const id = Number(params.id);

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
        await prisma.solidarityReceipts.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Receipt deleted" });
    } catch (err) {
        return NextResponse.json(
            { success: false, message: "Failed to delete receipt." },
            { status: 500 }
        );
    }
}
