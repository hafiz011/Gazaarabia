import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch current user and check if they're an affiliate
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        role: true,
        affiliate: {
          include: {
            bankAccount: {
              select: {
                accountName: true,
                accountNumber: true,
                sortCode: true,
                iban: true,
                paypalEmail: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.role?.name.toLowerCase() !== "affiliate") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!user.affiliate) {
      return NextResponse.json(
        { message: "Affiliate profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.affiliate.id,
        bankAccount: user.affiliate.bankAccount || null,
      },
    });
  } catch (error) {
    console.error("GET BANK DETAILS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch bank details" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify user is affiliate
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true, affiliate: true },
    });

    if (!user || user.role?.name.toLowerCase() !== "affiliate") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!user.affiliate) {
      return NextResponse.json(
        { message: "Affiliate profile not found" },
        { status: 404 }
      );
    }

    const { accountName, accountNumber, sortCode, iban, paypalEmail } =
      await req.json();

    // Update or create bank account
    const bankAccount = await prisma.affiliateBankAccount.upsert({
      where: { affiliateId: user.affiliate.id },
      update: {
        accountName,
        accountNumber,
        sortCode,
        iban,
        paypalEmail,
      },
      create: {
        affiliateId: user.affiliate.id,
        accountName,
        accountNumber,
        sortCode: sortCode || undefined,
        iban: iban || undefined,
        paypalEmail: paypalEmail || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Bank details updated successfully",
      data: bankAccount,
    });
  } catch (error) {
    console.error("UPDATE BANK DETAILS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update bank details" },
      { status: 500 }
    );
  }
}
