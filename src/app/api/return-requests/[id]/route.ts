import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { sendReturnStatusEmail } from "@/lib/helpers/emailHelper";

const prisma: any = new PrismaClient();

// GET — Single Return Request
export async function GET(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const adminUser = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (adminUser?.role?.name.toLowerCase() !== "admin")
        return NextResponse.json({ success: false, message: "Admin Only" }, { status: 403 });

    try {
        const request = await prisma.returnRequest.findUnique({
            where: { id: Number(params.id) },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                order: { select: { id: true, createdAt: true } },
                orderItem: {
                    include: {
                        product: { select: { title: true, productimage: true } },
                        variant: { include: { color: true, size: true } },
                    },
                },
                reason: true,
            },
        });

        return NextResponse.json({ success: true, data: request }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to fetch" }, { status: 500 });
    }
}


// PATCH — Update Status
export async function PATCH(req: NextRequest, { params }: any) {
    const userId = await checkAuth(req);
    if (!userId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    const allowedRoles = ["admin"];

    if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }


    const { status, adminNote, refundAmount } = await req.json();

    try {
        const updated = await prisma.returnRequest.update({
            where: { id: Number(params.id) },
            data: { status, adminNote: adminNote || null, refundAmount: refundAmount || null },
            include: { user: true, orderItem: true },
        });


        //  Send Customer Email — NOW
        await sendReturnStatusEmail({
            to: updated.user.email,
            userId: updated.user.id,
            orderItemId: updated.orderItemId,
            status,
            adminNote,
            refundAmount,
        });


        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        return NextResponse.json({ success: false, message: "Failed to update status" }, { status: 500 });
    }
}
