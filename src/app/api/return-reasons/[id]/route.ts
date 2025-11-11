import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// UPDATE
export async function PUT(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId)
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    //  Admin check
    const adminUser = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!adminUser || adminUser.role?.name.toLowerCase() !== "admin")
        return NextResponse.json({ success: false, message: "Access denied — Admin only." }, { status: 403 });

    const { id } = params;
    const { label, requireImage } = await req.json();

    const updated = await prisma.returnReason.update({
        where: { id: Number(id) },
        data: { label: label.trim(), requireImage: Boolean(requireImage) },
    });

    return NextResponse.json({ success: true, data: updated });
}

// DELETE
export async function DELETE(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId)
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    //  Admin check
    const adminUser = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });
    if (!adminUser || adminUser.role?.name.toLowerCase() !== "admin")
        return NextResponse.json({ success: false, message: "Access denied — Admin only." }, { status: 403 });

    const { id } = params;
    await prisma.returnReason.delete({ where: { id: Number(id) } });

    return NextResponse.json({ success: true, message: "Deleted successfully" });
}
