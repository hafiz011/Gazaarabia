import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
// @ts-ignore - Import from separate email flows file
import { sendRefundConfirmationEmail } from "@/lib/helpers/emailFlows9-14";

const prisma: any = new PrismaClient();

// PROCESS REFUND (Admin only)
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user || user.role?.name?.toLowerCase() !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin only" }, { status: 403 });
    }

    const { orderId, refundAmount } = await req.json();

    if (!orderId || !refundAmount) {
      return NextResponse.json({ message: "orderId and refundAmount required" }, { status: 400 });
    }

    // Fetch order with user info
    const order = await prisma.orders.findUnique({
      where: { id: Number(orderId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Create refund record (if you have a refunds table)
    // For now, we'll just update the order status
    const refundedOrder = await prisma.orders.update({
      where: { id: Number(orderId) },
      data: {
        status: "refunded",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Send refund confirmation email
    await sendRefundConfirmationEmail({
      to: refundedOrder.user.email,
      orderId: refundedOrder.id,
      refundAmount: Number(refundAmount),
      paymentMethod: order.paymentMethod || "Unknown",
      userId: refundedOrder.user.id,
    });

    return NextResponse.json({
      message: "Refund processed successfully",
      order: refundedOrder,
    });
  } catch (error: any) {
    console.error("Refund processing error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
