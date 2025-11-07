import { NextRequest, NextResponse } from "next/server";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { PrismaClient } from "@prisma/client";
const prisma: any = new PrismaClient();

// GET: List monthly invoices
export async function GET(req: NextRequest) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.role.name.toLowerCase() !== "admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const invoices = await prisma.affiliateInvoice.findMany({
    include: {
      affiliate: {
        select: { user: { select: { name: true, email: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ data: invoices }, { status: 200 });
}

// POST: Mark invoice as paid
export async function POST(req: NextRequest) {
  const { invoiceId, paymentMethod, paymentRef } = await req.json();
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const invoice = await prisma.affiliateInvoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) return NextResponse.json({ message: "Invoice not found" }, { status: 404 });

  // ✅ Extract Year + Month from monthLabel (e.g. "February 2025")
  const [monthName, yearStr] = invoice.monthLabel.split(" ");
  const year = Number(yearStr);
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth(); // Converts month name to month index (0-11)

  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 1);

  // ✅ Mark invoice as paid
  await prisma.affiliateInvoice.update({
    where: { id: invoiceId },
    data: {
      isPaid: true,
      paymentMethod,
      paymentRef,
      paidAt: new Date(),
    },
  });

  // ✅ Mark all orders in this month as paid
  await prisma.orders.updateMany({
    where: {
      affiliateId: invoice.affiliateId,
      affiliatePaid: false,
      createdAt: {
        gte: monthStart,
        lt: monthEnd,
      }
    },
    data: {
      affiliatePaid: true
    },
  });

  return NextResponse.json(
    { success: true, message: "Invoice marked as paid successfully." },
    { status: 200 }
  );
}

