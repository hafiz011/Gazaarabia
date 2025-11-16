import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const userId = await checkAuth(req);
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Fetch user + affiliate details
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      include: {
        affiliate: {
          select: {
            id: true,
            type: true,
          },
        },
        role: true,
      },
    });

    // Must be affiliate
    if (!user || user.role.name !== "affiliate") {
      return NextResponse.json(
        { message: "Only affiliates can access this resource" },
        { status: 403 }
      );
    }

    // Affiliate must be Ambassador
    if (!user.affiliate || user.affiliate.type !== "ambassador") {
      return NextResponse.json(
        { message: "Only ambassadors can view ambassador order items" },
        { status: 403 }
      );
    }

    const ambassadorId = user.affiliate.id;
    const { id } = await context.params;

    // Fetch order item
    const item = await prisma.orderItem.findUnique({
      where: { id: Number(id) },
      include: {
        product: {
          select: {
            title: true,
            productimage: { take: 1, select: { url: true } },
          },
        },
        variant: {
          select: {
            sku: true,
            color: { select: { name: true } },
            size: { select: { name: true } },
          },
        },
        order: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    // Item must exist
    if (!item) {
      return NextResponse.json(
        { message: "Order item not found" },
        { status: 404 }
      );
    }

    // Ambassador must own this item
    if (item.ambassadorId !== ambassadorId) {
      return NextResponse.json(
        { message: "Access denied: This item does not belong to you" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    console.error("Ambassador Order Item Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error.message },
      { status: 500 }
    );
  }
}
