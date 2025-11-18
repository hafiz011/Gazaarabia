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

        // Ensure the order belongs to this user
        const order = await prisma.orders.findFirst({
            where: { id: orderId, userId },
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Invalid order or permission denied." },
                { status: 403 }
            );
        }


        //==================== canculate expected return amount start =====================

        // Fetch order item
        const orderItem = await prisma.orderItem.findUnique({
            where: { id: orderItemId },
        });

        if (!orderItem) {
            return NextResponse.json(
                { success: false, message: "Invalid order item." },
                { status: 404 }
            );
        }


        // Calculate original item total (no discount)
        const itemTotal = orderItem.price * orderItem.quantity;

        // Get order-level subtotal and discount
        const orderSubtotal = order.itemsTotal;       // full price total of items
        const orderDiscount = order.discountTotal;    // order-level discount

        // Calculate item's share of the discount
        let itemShareDiscount = 0;

        if (orderSubtotal > 0 && orderDiscount > 0) {
            itemShareDiscount = (itemTotal / orderSubtotal) * orderDiscount;
        }

        // Final expected return amount
        const expectedReturnAmount = itemTotal - itemShareDiscount;

        //========================== canculate expected return amount end =======================


        //  Save images directly as JSON
        await prisma.returnRequest.create({
            data: {
                userId,
                orderId,
                orderItemId,
                reasonId,
                note: note || null,
                images: images && images.length > 0 ? images : null,
                status: "pending",
                expectedReturnAmount: expectedReturnAmount,
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
