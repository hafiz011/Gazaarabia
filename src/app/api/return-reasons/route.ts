import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// GET - List
export async function GET(req: NextRequest) {
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

    const reasons = await prisma.returnReason.findMany({ orderBy: { id: "desc" } });

    return NextResponse.json({ success: true, data: reasons });
}

// POST - Create
export async function POST(req: NextRequest) {
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

    const { label, requireImage } = await req.json();

    if (!label?.trim()) {
        return NextResponse.json({ success: false, message: "Label is required." }, { status: 400 });
    }

    const exists = await prisma.returnReason.findUnique({ where: { label: label.trim() } });
    if (exists) {
        return NextResponse.json({ success: false, message: "This reason already exists." }, { status: 409 });
    }

    const reason = await prisma.returnReason.create({
        data: { label: label.trim(), requireImage: Boolean(requireImage) },
    });

    return NextResponse.json({ success: true, data: reason }, { status: 201 });
}
