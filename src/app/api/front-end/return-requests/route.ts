import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// POST - Submit Return Request (User Only)
export async function POST(req: NextRequest) {
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json(
            { success: false, message: "Unauthorized — Login required." },
            { status: 401 }
        );
    }

    try {
        const { orderId, orderItemId, reasonId, note, images } = await req.json();

        if (!orderId || !orderItemId || !reasonId) {
            return NextResponse.json(
                { success: false, message: "Missing required fields." },
                { status: 400 }
            );
        }

        // ✅ Ensure the order belongs to this user
        const order = await prisma.orders.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Invalid order or permission denied." },
                { status: 403 }
            );
        }

        // ✅ Save images directly as JSON
        await prisma.returnRequest.create({
            data: {
                userId,
                orderId,
                orderItemId,
                reasonId,
                note: note || null,
                images: images && images.length > 0 ? images : null,
                status: "pending",
            },
        });

        return NextResponse.json(
            { success: true, message: "Return request submitted successfully." },
            { status: 201 }
        );
    } catch (error) {
        console.error("POST Return Request Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to submit return request." },
            { status: 500 }
        );
    }
}
