import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 * ADMIN: List all reviews
 */
export async function GET(req: NextRequest) {
  try {
    const adminId = await checkAuth(req);
    if (!adminId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    //  Verify admin role
    const adminUser = await prisma.users.findUnique({
      where: { id: adminId },
      include: { role: true },
    });

    if (adminUser?.role?.name.toLowerCase() !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied — Admin only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");

    const where: any = {};

    if (productId) where.productId = Number(productId);
    if (userId) where.userId = Number(userId);

    //  Optional search across fields
    if (search) {
      where.OR = [
        { comment: { contains: search } },
        {
          user: {
            name: { contains: search },
          },
        },
        {
          product: {
            title: { contains: search },
          },
        },
      ];
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, title: true, slug: true } },
        variant: {
          select: {
            id: true,
            sku: true,
            color: { select: { name: true } },
            size: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    console.error("Admin Review List GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews." },
      { status: 500 }
    );
  }
}
