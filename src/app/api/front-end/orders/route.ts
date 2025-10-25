import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma:any = new PrismaClient();

/**
 * @route GET /api/orders
 * @desc Get all orders for the authenticated user (Protected)
 */
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.orders.findMany({
      where: { userId: Number(userId) },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                sellingPrice: true,
                productimage: { select: { url: true }, take: 1 },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      message: orders.length
        ? "Orders fetched successfully."
        : "No orders found.",
      data: orders,
    });
  } catch (error) {
    console.error(" GET Orders Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/orders
 * @desc Create a new order (Protected)
 */
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { totalAmount, paymentMethod,paypalOrderId, paymentStatus, orderItems } =
      await req.json();

    if (!totalAmount || !paymentMethod || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const newOrder = await prisma.orders.create({
      data: {
        userId: Number(userId),
        totalAmount,
        paymentMethod,
        transactionId: paypalOrderId,
        status: (paymentStatus || "completed").toLowerCase(),
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully.",
      data: newOrder,
    });
  } catch (error) {
    console.error("POST Orders Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order." },
      { status: 500 }
    );
  }
}
