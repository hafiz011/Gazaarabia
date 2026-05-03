import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { getReviewDetails } from "@/lib/helpers/getReviewByOrderItemId";


const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    //  Authentication check
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role?.name.toLowerCase() !== "seller") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }


    const seller = await prisma.seller.findUnique({
      where: { userId: user.id },
    });

    if (!seller) {
      return NextResponse.json({ message: "Seller profile not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    const sellerCondition = {
      orderItems: {
        some: { sellerId: seller.id }
      }
    };

    const where: any = search
      ? {
        AND: [
          sellerCondition,
          {
            OR: [
              { transactionId: { contains: search } },
              { status: { contains: search } },
              { paymentMethod: { contains: search } },
              ...(isNaN(Number(search)) ? [] : [{ id: Number(search) }]),
              {
                user: {
                  name: { contains: search },
                },
              },
            ],
          }
        ]
      }
      : sellerCondition;


    //  Fetch orders
    const orders = await prisma.orders.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },


        orderItems: {
          where: { sellerId: seller.id },
          select: {
            id: true,
            sellerId: true,
            quantity: true,
            price: true,
            commissionValue: true,
            commissionAmount: true,
            sellerEarning: true,
            payoutDays: true,
            isPayoutEligible: true,
            isPaidOut: true,
            product: { select: { title: true } },
            variant: {
              select: {
                sku: true,
                color: { select: { name: true } },
                size: { select: { name: true } },
              },
            },
            reviewed: true
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    //  Add review data per order item using your helper
    const formattedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const updatedItems = await Promise.all(
          order.orderItems.map(async (item: any) => {
            const review = await getReviewDetails(item.id);

            return {
              ...item,
              review: review,
              // reviewed: !!review, //  true if a review exists
            };
          })
        );

        return { ...order, orderItems: updatedItems };
      })
    );

    return NextResponse.json({ success: true, data: formattedOrders });
    // return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error(" Orders GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}


