import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // await params

    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!affiliate) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: affiliate });
  } catch (err) {
    return NextResponse.json({ message: "Failed to fetch affiliate" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // affiliateId
    const affiliateId = Number(id);

    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const admin = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!admin || admin.role.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, email, phone, password, baseCommission, shareCommission, isActive, type } = body;

    //  First fetch affiliate to get the real userId
    const affiliate = await prisma.affiliate.findUnique({
      where: { id: affiliateId },
      include: { user: true },
    });

    if (!affiliate) {
      return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });
    }

    //  Update User
    await prisma.users.update({
      where: { id: affiliate.userId },
      data: {
        name,
        email,
        phone,
        ...(password ? { password: await hash(password, 10) } : {}),
      },
    });

    //  Update Affiliate
    await prisma.affiliate.update({
      where: { id: affiliateId },
      data: {
        type,
        baseCommission,
        shareCommission,
        isActive,
      },
    });

    return NextResponse.json({ success: true, message: "Affiliate updated successfully." });
  } catch (err) {
    console.error("AFFILIATE UPDATE ERROR:", err);
    return NextResponse.json({ message: "Failed to update affiliate" }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; //  await params

    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user || user.role?.name.toLowerCase() !== "admin")
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });

    const affiliate = await prisma.affiliate.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!affiliate) return NextResponse.json({ message: "Affiliate not found" }, { status: 404 });

    await prisma.$transaction([
      prisma.affiliate.delete({ where: { id: Number(id) } }),
      prisma.users.delete({ where: { id: affiliate.userId } }),
    ]);

    return NextResponse.json({ success: true, message: "Affiliate deleted successfully" }, { status: 200 });

  } catch (error) {
    console.error("DELETE AFFILIATE ERROR:", error);
    return NextResponse.json({ success: false, message: "Failed to delete affiliate" }, { status: 500 });
  }
}
