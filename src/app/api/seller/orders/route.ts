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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

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
    const [total, orders] = await Promise.all([
      prisma.orders.count({ where }),
      prisma.orders.findMany({
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
        skip,
        take: limit,
      })
    ]);

    // Batch fetch reviews to avoid N+1
    const orderItemIds = orders.flatMap((o: any) => o.orderItems.map((i: any) => i.id));
    const reviews = await prisma.review.findMany({
      where: { orderItemId: { in: orderItemIds } },
      include: {
        product: { select: { title: true, productimage: { take: 1, select: { url: true } } } },
        variant: { select: { sku: true } },
        user: { select: { name: true, email: true } }
      }
    });

    const reviewsMap = reviews.reduce((acc: any, r: any) => {
      acc[r.orderItemId] = r;
      return acc;
    }, {});

    const formattedOrders = orders.map((order: any) => ({
      ...order,
      orderItems: order.orderItems.map((item: any) => ({
        ...item,
        review: reviewsMap[item.id] || null
      }))
    }));

    return NextResponse.json({ 
      success: true, 
      total,
      page,
      limit,
      data: formattedOrders 
    });
  } catch (error) {
    console.error(" Orders GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}


