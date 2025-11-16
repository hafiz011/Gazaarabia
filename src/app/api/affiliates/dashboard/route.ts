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

    //  Get affiliate record
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: Number(userId) },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate account not found" }, { status: 404 });
    }

    const affiliateId = affiliate.id;

    //
    // --- AFFILIATE METRICS (existing)
    //
    const invoices = await prisma.affiliateInvoice.findMany({
      where: { affiliateId },
      select: { totalAmount: true, isPaid: true },
    });

    const totalAffiliateEarnings = invoices.reduce((sum: number, i: any) => sum + i.totalAmount, 0);
    const pendingAffiliatePayouts = invoices
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

    //  Recent affiliate orders (keep your existing shape)
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

    //  Attach review data (as before)
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

    //
    // --- AMBASSADOR METRICS (new)
    //
    // Ambassador data lives on orderItem (product-level)
    // We'll get all order items where ambassadorId = affiliate.id
    // We'll compute total ambassador earnings and pending amounts, count, and recent items
    //
    const ambassadorItems = await prisma.orderItem.findMany({
      where: { ambassadorId: affiliateId },
      select: {
        id: true,
        orderId: true,
        createdAt: true,
        quantity: true,
        price: true,
        ambassadorCommission: true,
        ambassadorEarning: true,
        ambassadorPaid: true,
        product: { select: { id: true, title: true } },
        variant: {
          select: {
            sku: true,
            color: { select: { name: true } },
            size: { select: { name: true } },
          },
        },
      },
    });

    // totals
    const totalAmbassadorEarnings = ambassadorItems.reduce(
      (sum: number, it: any) => sum + (it.ambassadorEarning ?? 0),
      0
    );

    const pendingAmbassadorPayouts = ambassadorItems
      .filter((it: any) => !it.ambassadorPaid)
      .reduce((sum: number, it: any) => sum + (it.ambassadorEarning ?? 0), 0);

    const totalAmbassadorItems = ambassadorItems.length;

    // recent ambassador items (latest 5)
    const recentAmbassadorItems = ambassadorItems
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((it: any) => ({
        itemId: it.id,
        orderId: `ORD-${it.orderId}`,
        date: it.createdAt,
        productTitle: it.product?.title ?? "Product",
        sku: it.variant?.sku ?? null,
        qty: it.quantity ?? 1,
        price: it.price ?? 0,
        commissionRate: it.ambassadorCommission ?? 0,
        earned: it.ambassadorEarning ?? 0,
        paid: !!it.ambassadorPaid,
      }));

    //
    // --- COMBINED METRICS
    //
    const totalCombinedEarnings = totalAffiliateEarnings + totalAmbassadorEarnings;
    const pendingCombinedPayouts = pendingAffiliatePayouts + pendingAmbassadorPayouts;

    return NextResponse.json({
      success: true,
      data: {
        // affiliate (existing)
        totalAffiliateEarnings,
        pendingAffiliatePayouts,
        totalOrders,
        activeCoupons,
        referredCustomers,
        conversionRate,
        recentOrders,

        // ambassador (new)
        totalAmbassadorEarnings,
        pendingAmbassadorPayouts,
        totalAmbassadorItems,
        recentAmbassadorItems,

        // combined
        totalCombinedEarnings,
        pendingCombinedPayouts,
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
