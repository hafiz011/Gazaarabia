import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
// @ts-ignore - Import from separate email flows file
import { sendVendorOnboardingEmail1 } from "@/lib/helpers/emailVendorOnboarding";

const prisma: any = new PrismaClient();

// APPROVE SELLER (Admin only)
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user || user.role?.name?.toLowerCase() !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin only" }, { status: 403 });
    }

    const { sellerId, commission = 15 } = await req.json();

    if (!sellerId) {
      return NextResponse.json({ message: "sellerId required" }, { status: 400 });
    }

    // Fetch seller with user info
    const seller = await prisma.seller.findUnique({
      where: { id: Number(sellerId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!seller) {
      return NextResponse.json({ message: "Seller not found" }, { status: 404 });
    }

    // Update seller approval status
    const approvedSeller = await prisma.seller.update({
      where: { id: Number(sellerId) },
      data: {
        isApproved: true,
        commission: commission,
        approvedAt: new Date(),
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Send vendor onboarding email 1
    await sendVendorOnboardingEmail1({
      to: approvedSeller.user.email,
      vendorName: seller.storeName || approvedSeller.user.name,
      commission: commission,
    });

    return NextResponse.json({
      message: "Seller approved successfully and onboarding email sent",
      seller: approvedSeller,
    });
  } catch (error: any) {
    console.error("Seller approval error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
