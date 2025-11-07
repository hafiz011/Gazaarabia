import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getReviewDetails } from "@/lib/helpers/getReviewByOrderItemId";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Get affiliate record
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: Number(userId) },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate account not found" }, { status: 404 });
    }

    const affiliateId = affiliate.id;

    // ✅ Earnings summary
    const invoices = await prisma.affiliateInvoice.findMany({
      where: { affiliateId },
      select: { totalAmount: true, isPaid: true },
    });

    const totalEarnings = invoices.reduce((sum: number, i: any) => sum + i.totalAmount, 0);
    const pendingPayouts = invoices
      .filter((i: any) => !i.isPaid)
      .reduce((sum: number, i: any) => sum + i.totalAmount, 0);

    const totalOrders = await prisma.orders.count({ where: { affiliateId } });

    const activeCoupons = await prisma.coupon.count({
      where: { affiliateId, isActive: true },
    });

    const referredCustomersRaw = await prisma.orders.findMany({
      where: { affiliateId },
      select: { userId: true },
    });
    const referredCustomers = new Set(referredCustomersRaw.map((o: any) => o.userId)).size;

    const conversionRate =
      referredCustomers > 0
        ? `${((totalOrders / referredCustomers) * 100).toFixed(1)}%`
        : "0%";

    // ✅ Recent orders (with full details, like admin order API)
    const recentOrdersRaw = await prisma.orders.findMany({
      where: { affiliateId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { id: true, name: true, email: true } },

        affiliate: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },

        coupon: {
          select: { id: true, code: true, discountType: true, discountValue: true, affiliateId: true },
        },

        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: { select: { title: true } },
            variant: {
              select: {
                sku: true,
                color: { select: { name: true } },
                size: { select: { name: true } },
              },
            },
            reviewed: true,
          },
        },
      },
    });

    // ✅ Attach Review Data
    const recentOrders = await Promise.all(
      recentOrdersRaw.map(async (order: any) => ({
        ...order,
        orderId: `ORD-${order.id}`,
        amount: order.totalAmount,
        date: order.createdAt,
        orderItems: await Promise.all(
          order.orderItems.map(async (item: any) => ({
            ...item,
            review: await getReviewDetails(item.id),
          }))
        ),
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        totalEarnings,
        pendingPayouts,
        totalOrders,
        activeCoupons,
        referredCustomers,
        conversionRate,
        recentOrders,
      },
    });

  } catch (error: any) {
    console.error("Affiliate Dashboard Error:", error);
    return NextResponse.json(
      { message: "Server error", error: error?.message },
      { status: 500 }
    );
  }
}
