import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    //  Authenticate user
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Fetch user (for role + affiliate info)
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true, affiliate: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    //  Fetch coupon with its creator + affiliate info
    const coupon = await prisma.coupon.findUnique({
      where: { id: Number(params.id) },
      include: {
        creator: {
          include: { role: true },
        },
        affiliate: {
          include: { user: true },
        },
      },
    });

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    // Affiliate access rules
    if (user.role?.name.toLowerCase() === "affiliate") {
      // inactive affiliates can't view any coupon
      if (!user.affiliate?.isActive) {
        return NextResponse.json(
          { message: "Affiliate account is inactive." },
          { status: 403 }
        );
      }

      // affiliate can only see their own coupon
      if (coupon.creatorId !== userId) {
        return NextResponse.json(
          { message: "You are not authorized to view this coupon." },
          { status: 403 }
        );
      }
    }

    //  Optional: restrict non-admin, non-affiliate users from seeing others' coupons
    if (
      user.role?.name.toLowerCase() !== "admin" &&
      user.role?.name.toLowerCase() !== "affiliate"
    ) {
      if (coupon.creatorId !== userId) {
        return NextResponse.json(
          { message: "You are not authorized to view this coupon." },
          { status: 403 }
        );
      }
    }

    //  Return coupon
    return NextResponse.json({ data: coupon }, { status: 200 });
  } catch (err: any) {
    console.error("Get coupon error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    //  Auth check
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Parse body
    const data = await req.json();

    // Fetch logged-in user info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { affiliate: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    //  Get the existing coupon (with creator + affiliate)
    const coupon = await prisma.coupon.findUnique({
      where: { id: Number(params.id) },
      include: {
        creator: {
          include: { affiliate: true, role: true },
        },
        affiliate: true,
      },
    });

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    //  Determine new values
    const newDiscountValue = Number(data.discountValue ?? coupon.discountValue);
    const newDiscountType = data.discountType ?? coupon.discountType;

    //  1. If logged-in user is an affiliate → enforce their limit
    if (user.role?.name.toLowerCase() === "affiliate") {
      if (!user.affiliate || !user.affiliate.isActive) {
        return NextResponse.json(
          { message: "Affiliate account inactive or not found." },
          { status: 403 }
        );
      }

      const limit = user.affiliate.baseCommission;
      if (
        (newDiscountType === "percentage" && newDiscountValue > limit) ||
        (newDiscountType === "fixed" && newDiscountValue > limit)
      ) {
        return NextResponse.json(
          {
            message: `You cannot set a discount above your base commission limit (${limit}${newDiscountType === "percentage" ? "%" : "£"}).`,
          },
          { status: 403 }
        );
      }

      // Optional: make sure affiliate only edits their own coupon
      if (coupon.creatorId !== userId) {
        return NextResponse.json(
          { message: "You are not allowed to modify this coupon." },
          { status: 403 }
        );
      }
    }

    //  2. If admin is editing → check affiliate coupon limits
    if (user.role?.name.toLowerCase() === "admin" && coupon.affiliateId) {
      const targetAffiliate = await prisma.affiliate.findUnique({
        where: { id: coupon.affiliateId },
      });

      if (targetAffiliate && targetAffiliate.isActive) {
        const limit = targetAffiliate.baseCommission;

        if (
          (newDiscountType === "percentage" && newDiscountValue > limit) ||
          (newDiscountType === "fixed" && newDiscountValue > limit)
        ) {
          return NextResponse.json(
            {
              message: `This coupon belongs to an affiliate. You cannot set a discount above their base commission limit (${limit}${newDiscountType === "percentage" ? "%" : "£"}).`,
            },
            { status: 403 }
          );
        }
      }
    }

    // Proceed with update
    const updated = await prisma.coupon.update({
      where: { id: Number(params.id) },
      data: {
        ...data,
        discountValue: newDiscountValue,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(
      { message: "Updated successfully", data: updated },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Update coupon error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    //  Authenticate user
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch logged-in user info
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true, affiliate: true },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Fetch coupon details
    const coupon = await prisma.coupon.findUnique({
      where: { id: Number(params.id) },
      include: { creator: { include: { role: true } } },
    });

    if (!coupon) {
      return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
    }

    //  1. If affiliate — allow only if they created it
    if (user.role?.name.toLowerCase() === "affiliate") {
      if (coupon.creatorId !== userId) {
        return NextResponse.json(
          { message: "You are not authorized to delete this coupon." },
          { status: 403 }
        );
      }

      // Optional: prevent inactive affiliates from deleting anything
      if (!user.affiliate?.isActive) {
        return NextResponse.json(
          { message: "Affiliate account is inactive." },
          { status: 403 }
        );
      }
    }

    // 2. If admin — full delete access (optional: prevent deleting other admins’ coupons if needed)
    if (user.role?.name.toLowerCase() !== "admin") {
      // only affiliates/customers need ownership validation (admins skip)
      if (coupon.creatorId !== userId) {
        return NextResponse.json(
          { message: "You are not authorized to delete this coupon." },
          { status: 403 }
        );
      }
    }

    //  Perform delete
    await prisma.coupon.delete({ where: { id: Number(params.id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("Delete coupon error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
