import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function POST(req: Request) {
  try {
    //  Get logged-in user
    const token: any = getTokenFromHeader(req);
    const creatorId = getUserIdFromToken(token);

    if (!creatorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Extract body
    const {
      code,
      discountType = "percentage",
      discountValue,
      affiliateId,
      maxUsage,
      perUserLimit,
      minOrderAmount,
      startDate,
      endDate,
      isActive = true,
    } = await req.json();

    //  Validate required fields
    if (!code || !discountValue) {
      return NextResponse.json(
        { message: "Coupon code and discount value are required." },
        { status: 400 }
      );
    }

    //  Check for duplicates
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { message: "Coupon code already exists." },
        { status: 400 }
      );
    }


    //  Get user role and affiliate info
    const user = await prisma.users.findUnique({
      where: { id: creatorId },
      include: { affiliate: true, role: true },
    });

    let resolvedAffiliateId: number | null = null;

    if (user?.affiliate) {
      //  If user is an affiliate, automatically assign their affiliate ID
      resolvedAffiliateId = user.affiliate.id;
    } else if (affiliateId) {
      //  If admin provided affiliateId, use it
      resolvedAffiliateId = Number(affiliateId);
    }

    //  Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue: Number(discountValue),
        affiliateId: resolvedAffiliateId,
        creatorId, //  automatically logged-in user
        maxUsage: maxUsage ? Number(maxUsage) : null,
        perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json(
      { message: "Coupon created successfully", coupon },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("Coupon creation error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }

}


// GET ALL COUPONS
export async function GET(req: Request) {
  try {
    const token: any = getTokenFromHeader(req);
    const creatorId = getUserIdFromToken(token);

    if (!creatorId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const coupons = await prisma.coupon.findMany({
      include: {
        affiliate: { select: { id: true, user: { select: { name: true, email: true } } } },
        creator: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: coupons }, { status: 200 });
  } catch (err: any) {
    console.error("Coupon fetch error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }

}
