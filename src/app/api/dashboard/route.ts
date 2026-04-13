import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

//  GET Dashboard Counts
export async function GET(req: Request) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
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
      orders,
      sellers,
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
      prisma.users.count(),
      prisma.orders.count(),
      prisma.seller.count(),
    ]);

    const recentBlogs = await prisma.blogs.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    });

    /* ================= ORDERS OVER TIME ================= */
    const ordersOverTimeRaw = await prisma.orders.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const ordersOverTime = ordersOverTimeRaw.reduce((acc: any, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    /* ================= REVENUE OVER TIME ================= */
    const revenueOverTimeRaw = await prisma.orders.findMany({
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const revenueOverTime = revenueOverTimeRaw.reduce((acc: any, item) => {
      const date = item.createdAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + item.totalAmount;
      return acc;
    }, {});


    /* ================= ORDER STATUS ================= */
    const orderStatus = await prisma.orders.groupBy({
      by: ["status"],
      _count: { id: true },
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
      charts: {
        ordersOverTime,
        revenueOverTime,
        orderStatus,
      },
    });
  } catch (error) {
    console.error("DASHBOARD API ERROR:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
