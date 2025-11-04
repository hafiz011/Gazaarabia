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

    //  Parse request body
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

    //  Check duplicate coupon
    const existing = await prisma.coupon.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { message: "Coupon code already exists." },
        { status: 400 }
      );
    }

    // Fetch user (with role + affiliate)
    const user = await prisma.users.findUnique({
      where: { id: creatorId },
      include: { affiliate: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    //  Restrict access — only Admins or Affiliates can create coupons
    const roleName = user.role?.name?.toLowerCase();
    if (roleName !== "admin" && roleName !== "affiliate") {
      return NextResponse.json(
        { message: "You are not authorized to create coupons." },
        { status: 403 }
      );
    }

    //  Determine affiliate assignment
    let resolvedAffiliateId: number | null = null;

    if (roleName === "affiliate") {
      //  Affiliate user: auto-assign their affiliate ID
      if (!user.affiliate || !user.affiliate.isActive) {
        return NextResponse.json(
          { message: "Affiliate account inactive or not found." },
          { status: 403 }
        );
      }
      resolvedAffiliateId = user.affiliate.id;

      // Enforce base commission cap
      const baseLimit = user.affiliate.baseCommission;

      if (discountType === "percentage" && Number(discountValue) > baseLimit) {
        return NextResponse.json(
          {
            message: `You cannot create a coupon above your base commission limit (${baseLimit}%).`,
          },
          { status: 403 }
        );
      }

      if (discountType === "fixed" && Number(discountValue) > baseLimit) {
        return NextResponse.json(
          {
            message: `You cannot create a fixed discount coupon above your base commission (£${baseLimit.toFixed(
              2
            )}).`,
          },
          { status: 403 }
        );
      }
    }

    //  If admin is creating for affiliate, validate affiliate exists
    if (roleName === "admin" && affiliateId) {
      const targetAffiliate = await prisma.affiliate.findUnique({
        where: { id: Number(affiliateId) },
      });
      if (!targetAffiliate) {
        return NextResponse.json(
          { message: "Invalid affiliate selected." },
          { status: 400 }
        );
      }
      resolvedAffiliateId = Number(affiliateId);
    }

    //  Create coupon
    const coupon = await prisma.coupon.create({
      data: {
        code,
        discountType,
        discountValue: Number(discountValue),
        affiliateId: resolvedAffiliateId,
        creatorId,
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


export async function GET(req: Request) {
  try {
    //  Authenticate user
    const token: any = getTokenFromHeader(req);
    const creatorId = getUserIdFromToken(token);

    if (!creatorId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Fetch logged-in user
    const user = await prisma.users.findUnique({
      where: { id: creatorId },
      include: { role: true, affiliate: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const roleName = user.role?.name?.toLowerCase();

    // Restrict access to Admin & Affiliate only
    if (roleName !== "admin" && roleName !== "affiliate") {
      return NextResponse.json(
        { message: "You are not authorized to view coupons." },
        { status: 403 }
      );
    }

    //  If affiliate is inactive → deny access
    if (roleName === "affiliate" && !user.affiliate?.isActive) {
      return NextResponse.json(
        { message: "Affiliate account is inactive." },
        { status: 403 }
      );
    }

    // Fetch coupons
    let coupons;

    if (roleName === "admin") {
      //  Admin can see all coupons
      coupons = await prisma.coupon.findMany({
        include: {
          affiliate: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
            },
          },
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      //  Affiliate can see only their own coupons
      coupons = await prisma.coupon.findMany({
        where: { creatorId: creatorId },
        include: {
          affiliate: {
            select: {
              id: true,
              user: { select: { name: true, email: true } },
            },
          },
          creator: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ data: coupons }, { status: 200 });
  } catch (err: any) {
    console.error("Coupon fetch error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

