import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getAffiliateEarnings } from "@/lib/helpers/affiliateEarnings";
import bcrypt from "bcryptjs";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Validate token from header
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Check role
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role?.name.toLowerCase() !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Fetch affiliates
    const affiliates = await prisma.affiliate.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = await Promise.all(
      affiliates.map(async (aff: any) => {
        const { totalEarnings, pendingEarnings } = await getAffiliateEarnings(aff.id);

        return {
          ...aff,
          totalEarnings,
          pendingEarnings,
        };
      })
    );


    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("AFFILIATE LIST ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch affiliates" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const token: any = getTokenFromHeader(req);
    const adminId = getUserIdFromToken(token);

    if (!adminId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Validate admin
    const admin = await prisma.users.findUnique({
      where: { id: adminId },
      include: { role: true },
    });

    if (!admin || admin.role.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const { name, email, phone, password, baseCommission, shareCommission, isActive, type } =
      await req.json();

    if (!password || password.length < 6)
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });

    // Check unique email
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ message: "Email already exists" }, { status: 400 });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with affiliate role
    const user = await prisma.users.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: { connect: { name: "affiliate" } },
      },
    });

    // Create affiliate record
    const affiliate = await prisma.affiliate.create({
      data: {
        userId: user.id,
        type,
        baseCommission: Number(baseCommission),
        shareCommission: Number(shareCommission),
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: affiliate });
  } catch (err: any) {
    console.error("CREATE AFFILIATE ERROR:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Server Error" },
      { status: 500 }
    );
  }
}
