import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 * ADMIN: Create a new review manually
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await checkAuth(req);
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    //  Ensure the logged-in user is an admin
    const adminUser = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (adminUser?.role?.name.toLowerCase() !== "admin") {
      return NextResponse.json(
        { success: false, message: "Access denied — Admin only." },
        { status: 403 }
      );
    }

    const { productId, userId: targetUserId, rating, comment, variantId } =
      await req.json();

    if (!productId || !targetUserId || !rating) {
      return NextResponse.json(
        { success: false, message: "Missing required fields." },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: targetUserId,
        rating,
        comment: comment || "",
        variantId: variantId || null,
      },
    });

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error("Admin Review POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create review." },
      { status: 500 }
    );
  }
}

/**
 * Get users and products (for dropdowns)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await checkAuth(req);
    if (!userId)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const [users, products] = await Promise.all([
      prisma.users.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      prisma.products.findMany({
        select: { id: true, title: true },
        where: { active: true },
        orderBy: { title: "asc" },
      }),
    ]);

    return NextResponse.json({ success: true, data: { users, products } });
  } catch (error) {
    console.error("Admin Review GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch data." },
      { status: 500 }
    );
  }
}


