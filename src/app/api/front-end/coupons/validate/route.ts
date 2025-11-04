import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma :any = new PrismaClient();

/**
 * POST /api/front-end/coupons/validate
 * Validate and calculate coupon discount
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, orderTotal } = body;

    if (!code || !orderTotal) {
      return NextResponse.json(
        { message: "Coupon code and order total are required." },
        { status: 400 }
      );
    }

    const token :any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    // Find coupon
    const coupon = await prisma.coupon.findUnique({
      where: { code },
      include: { creator: true, affiliate: true },
    });

    if (!coupon)
      return NextResponse.json({ message: "Invalid coupon code." }, { status: 400 });

    if (!coupon.isActive)
      return NextResponse.json({ message: "This coupon is inactive." }, { status: 400 });

    // Check date validity
    const now = new Date();
    if (coupon.startDate && now < coupon.startDate)
      return NextResponse.json({ message: "This coupon is not yet active." }, { status: 400 });

    if (coupon.endDate && now > coupon.endDate)
      return NextResponse.json({ message: "This coupon has expired." }, { status: 400 });

    // Check order minimum
    if (coupon.minOrderAmount && orderTotal < coupon.minOrderAmount)
      return NextResponse.json(
        { message: `Minimum order amount is £${coupon.minOrderAmount.toFixed(2)}.` },
        { status: 400 }
      );

    // Global usage
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage)
      return NextResponse.json(
        { message: "This coupon has reached its maximum usage limit." },
        { status: 400 }
      );

    // Per user usage
    if (userId && coupon.perUserLimit) {
      const usedCount = await prisma.orders.count({
        where: { userId, couponCode: code },
      });
      if (usedCount >= coupon.perUserLimit)
        return NextResponse.json(
          { message: "You’ve already used this coupon the maximum number of times." },
          { status: 400 }
        );
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn’t exceed total
    discountAmount = Math.min(discountAmount, orderTotal);

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully.",
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        creator: coupon.creator
          ? { id: coupon.creator.id, name: coupon.creator.name }
          : null,
      },
    });
  } catch (err: any) {
    console.error("Coupon validate error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
