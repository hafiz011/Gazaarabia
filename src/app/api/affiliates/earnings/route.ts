import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const affiliate = await prisma.affiliate.findUnique({ where: { userId } });
    if (!affiliate) return NextResponse.json({ message: "Not an affiliate" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const month = searchParams.get("month");

    const filters: any = { affiliateId: affiliate.id };

    if (status === "paid") filters.isPaid = true;
    if (status === "pending") filters.isPaid = false;
    if (month && month !== "all") filters.monthKey = month; // stored as YYYY-MM

    const invoices = await prisma.affiliateInvoice.findMany({
      where: filters,
      orderBy: { createdAt: "desc" },
    });

    // Summary calculations
    const totalEarned = invoices.reduce((sum: number, i: any) => sum + i.totalAmount, 0);
    const totalPaid = invoices.filter((i: any) => i.isPaid).reduce((sum: number, i: any) => sum + i.totalAmount, 0);
    const totalPending = totalEarned - totalPaid;

    return NextResponse.json({
      success: true,
      data: {
        invoices,
        summary: {
          totalEarned,
          totalPaid,
          totalPending,
        },
      },
    });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch earnings" }, { status: 500 });
  }
}
