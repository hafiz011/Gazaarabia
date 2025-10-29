import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { payment, address, orderItems } = await req.json();

    if (!payment?.totalAmount || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const newOrder = await prisma.orders.create({
      data: {
        userId: Number(userId),

        //  Payment & totals
        totalAmount: payment.totalAmount,
        itemsTotal: payment.itemsTotal,
        subtotal: payment.subtotal,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.paypalOrderId,
        status: (payment.paymentStatus || "completed").toLowerCase(),
        paypalResponse: payment.paypalResponse,

        //  Address snapshot
        addressId: address.id,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        country: address.country,
        postalCode: address.postalCode,
        phone: address.phone,

        //  Order items
        orderItems: {
          create: orderItems.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            colorId: item.colorId,
            sizeId: item.sizeId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { orderItems: true },
    });

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
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



export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                productimage: true,
                productvariant: {
                  include: {
                    color: true,
                    size: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders." },
      { status: 500 }
    );
  }
}
