import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
// @ts-ignore - Import from separate email flows file
import { sendOrderCancellationEmail } from "@/lib/helpers/emailFlows9-14";

const prisma: any = new PrismaClient();

// CANCEL ORDER (Admin only)
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

    const { orderId, reason } = await req.json();

    if (!orderId) {
      return NextResponse.json({ message: "orderId required" }, { status: 400 });
    }

    // Fetch current order with user info
    const order = await prisma.orders.findUnique({
      where: { id: Number(orderId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Update order status to cancelled
    const cancelledOrder = await prisma.orders.update({
      where: { id: Number(orderId) },
      data: {
        status: "cancelled",
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Send cancellation email
    await sendOrderCancellationEmail({
      to: cancelledOrder.user.email,
      orderId: cancelledOrder.id,
      reason: reason || "Cancelled by admin",
      userId: cancelledOrder.user.id,
    });

    return NextResponse.json({
      message: "Order cancelled successfully",
      order: cancelledOrder,
    });
  } catch (error: any) {
    console.error("Order cancellation error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
