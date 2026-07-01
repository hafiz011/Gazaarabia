import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { MAX_COMMISSION } from "@/lib/validation/commission";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate account not found" }, { status: 404 });
    }

    // Calculate earnings summary
    const invoices = await prisma.affiliateInvoice.findMany({
      where: { affiliateId: affiliate.id },
      select: { totalAmount: true, isPaid: true },
    });

    const totalEarned = invoices.reduce((sum: any, i: any) => sum + i.totalAmount, 0);
    const pending = invoices.filter((i: any) => !i.isPaid).reduce((sum: any, i: any) => sum + i.totalAmount, 0);
    const paid = totalEarned - pending; // Paid = total - pending

    return NextResponse.json({
      success: true,
      data: {
        name: affiliate.user.name,
        email: affiliate.user.email,
        baseCommission: affiliate.baseCommission,
        shareCommission: affiliate.shareCommission,
        referralCode: affiliate.referralCode,
        totalEarned,
        paid,
        pending,
        joinedAt: affiliate.createdAt,
      },
    });
  } catch (err) {
    console.error("Affiliate Profile Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}


export async function PUT(req: NextRequest) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate affiliate exists for this user
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      return NextResponse.json(
        { message: "Only affiliates can update settings" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const shareCommissionRaw = body.shareCommission;

    if (shareCommissionRaw === undefined || shareCommissionRaw === null) {
      return NextResponse.json(
        { message: "shareCommission is required" },
        { status: 400 }
      );
    }

    const shareCommission = Number(shareCommissionRaw);
    if (Number.isNaN(shareCommission)) {
      return NextResponse.json(
        { message: "shareCommission must be a valid number" },
        { status: 400 }
      );
    }

    // Global bound (0..MAX_COMMISSION)
    if (shareCommission < 0 || shareCommission > MAX_COMMISSION) {
      return NextResponse.json(
        { message: `shareCommission must be between 0 and ${MAX_COMMISSION}%` },
        { status: 400 }
      );
    }

    // NEW: cannot exceed baseCommission
    const baseCommission = Number(affiliate.baseCommission ?? 0);
    if (shareCommission > baseCommission) {
      return NextResponse.json(
        { message: `shareCommission cannot be greater than your baseCommission (${baseCommission}%)` },
        { status: 400 }
      );
    }

    // Update
    const updated = await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { shareCommission: Number(shareCommission) },
      select: {
        id: true,
        shareCommission: true,
        baseCommission: true,
        userId: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Share commission updated successfully",
      data: updated,
    });

  } catch (err: any) {
    console.error("Affiliate Update Error:", err);
    return NextResponse.json(
      { message: "Server error", error: err?.message || err },
      { status: 500 }
    );
  }


}