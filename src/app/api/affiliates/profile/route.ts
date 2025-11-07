import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

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
