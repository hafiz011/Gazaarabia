import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any = new PrismaClient();

// ✅ CREATE a new review
export async function POST(req: NextRequest) {
  try {
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderItemId, productId, variantId, rating, comment } = await req.json();

    if (!orderItemId || !productId || !rating) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    // 🚫 Optional: Prevent duplicate reviews for same product+variant by same user
    const existing = await prisma.review.findFirst({
      where: {
        userId,
        orderItemId,
        productId,
        ...(variantId ? { variantId } : { variantId: null }),
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "You have already reviewed this item." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        orderItemId,
        productId,
        variantId: variantId || null,
        rating,
        comment: comment || "",
        userId,
      },
    });

   // ✅ Update the reviewed flag on the specific order item
    await prisma.orderItem.update({
      where: { id: orderItemId }, // ✅ Correct field name
      data: { reviewed: true },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("❌ Review POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create review" },
      { status: 500 }
    );
  }
}

// ✅ GET all reviews (admin or listing purpose)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const variantId = searchParams.get("variantId");

    const where: any = {};
    if (productId) where.productId = Number(productId);
    if (variantId) where.variantId = Number(variantId);

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, name: true } },
        product: { select: { id: true, title: true } },
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
    console.error("❌ Review GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
