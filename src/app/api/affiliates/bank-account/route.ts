import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

// NOTE: Prefer /api/affiliates/me/bank-details for new work. This route is kept
// for backwards compatibility and now enforces the same affiliate-role check.
async function requireAffiliate(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });
  return !!user && user.role?.name.toLowerCase() === "affiliate";
}

export async function GET(req: Request) {
  try {
    const token = getTokenFromHeader(req);
    const userId = token ? getUserIdFromToken(token) : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await requireAffiliate(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: { bankAccount: true },
    });

    return NextResponse.json({ success: true, data: affiliate?.bankAccount });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = getTokenFromHeader(req);
    const userId = token ? getUserIdFromToken(token) : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await requireAffiliate(userId))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { accountName, accountNumber, sortCode, iban, paypalEmail } = body;

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    const bankAccount = await prisma.affiliateBankAccount.upsert({
      where: { affiliateId: affiliate.id },
      update: {
        accountName,
        accountNumber,
        sortCode,
        iban,
        paypalEmail,
      },
      create: {
        affiliateId: affiliate.id,
        accountName,
        accountNumber,
        sortCode,
        iban,
        paypalEmail,
      },
    });

    return NextResponse.json({ success: true, data: bankAccount });
  } catch (error) {
    console.error("Bank account save error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
