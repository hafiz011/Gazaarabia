import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { sendOrderShippedEmail } from "@/lib/helpers/emailHelper";
// @ts-ignore - Import from separate email flows file
import { sendOrderCancellationEmail } from "@/lib/helpers/emailFlows9-14";

const prisma: any = new PrismaClient();

// UPDATE ORDER STATUS (Admin only)
export async function PATCH(req: NextRequest) {
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

    const { orderId, status, trackingNumber } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ message: "orderId and status required" }, { status: 400 });
    }

    // Fetch current order with user info
    const order = await prisma.orders.findUnique({
      where: { id: Number(orderId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Update order
    const updatedOrder = await prisma.orders.update({
      where: { id: Number(orderId) },
      data: {
        status: status.toLowerCase(),
        trackingNumber: trackingNumber || null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Send notification email based on status
    if (status.toLowerCase() === "dispatched" || status.toLowerCase() === "shipped") {
      await sendOrderShippedEmail({
        to: updatedOrder.user.email,
        name: updatedOrder.user.name,
        userId: updatedOrder.user.id,
        trackingNumber: trackingNumber || undefined,
      });
    }

    return NextResponse.json({
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
