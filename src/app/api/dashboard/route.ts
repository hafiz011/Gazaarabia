import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

// ✅ GET Dashboard Counts
export async function GET(req: Request) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      blogs,
      blogCategories,
      brands,
      sizes,
      colors,
      categories,
      subcategories,
      deliveryOptions,
      materialCares,
      products,
      users,
      orders
    ] = await Promise.all([
      prisma.blogs.count(),
      prisma.blogCategories.count(),
      prisma.brand.count(),
      prisma.sizes.count(),
      prisma.colors.count(),
      prisma.categories.count(),
      prisma.subcategory.count(),
      prisma.deliveryOptions.count(),
      prisma.materialCare.count(),
      prisma.products.count(),
      prisma.users.count(),     // ✅ New
      prisma.orders.count(),    // ✅ New
    ]);

    const recentBlogs = await prisma.blogs.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    });

    return NextResponse.json({
      blogs,
      blogCategories,
      brands,
      sizes,
      colors,
      categories,
      subcategories,
      deliveryOptions,
      materialCares,
      products,
      users, 
      orders,   
      recentBlogs,
    });
  } catch (error) {
    console.error("DASHBOARD API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
