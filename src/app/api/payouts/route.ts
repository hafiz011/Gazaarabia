import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { generateAffiliateInvoicePDF } from "@/lib/utils/generateAffiliateInvoice";

const prisma: any = new PrismaClient();

// GET: List affiliates pending payouta
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

  const affiliates = await prisma.affiliate.findMany({
    include: {
      user: { select: { name: true, email: true } },
      payouts: true,
    },
  });

  return NextResponse.json({ data: affiliates }, { status: 200 });
}


// POST: Mark payout as paid
export async function POST(req: NextRequest) {
  const { affiliateId, paymentMethod, paymentRef } = await req.json();

  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.role.name.toLowerCase() !== "admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const affiliate = await prisma.affiliate.findUnique({ where: { id: affiliateId } });
  if (!affiliate) return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });

  const amount = affiliate.pendingEarnings;

  if (amount <= 0)
    return NextResponse.json({ message: "No pending earnings to payout" }, { status: 400 });

  const payoutRecord = await prisma.payout.create({
    data: {
      affiliateId,
      amount,
      paymentMethod,
      paymentRef,
      status: "paid",
      paidAt: new Date(),
    },
    include: { affiliate: { include: { user: true } } }
  });

  // === Generate Invoice ===
  const invoiceNumber = `INV-${payoutRecord.id.toString().padStart(5, "0")}`;
  const invoiceUrl = await generateAffiliateInvoicePDF({
    affiliateName: payoutRecord.affiliate.user.name,
    affiliateEmail: payoutRecord.affiliate.user.email,
    payoutAmount: payoutRecord.amount,
    paymentMethod: payoutRecord.paymentMethod!,
    paymentRef: payoutRecord.paymentRef!,
    payoutDate: payoutRecord.paidAt!.toLocaleDateString(),
    invoiceNumber,
  });

  //  Save invoice URL in DB
  await prisma.payout.update({
    where: { id: payoutRecord.id },
    data: { invoiceUrl, status: "paid", paidAt: new Date(), }
  });


  await prisma.affiliate.update({
    where: { id: affiliateId },
    data: { pendingEarnings: 0 },
  });

  return NextResponse.json({ success: true, message: "Payout marked as paid", invoiceUrl });
}
