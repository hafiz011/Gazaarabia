import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // 🔥 Fetch all filter data in parallel
    const [brands, categories, subcategories] = await Promise.all([
      prisma.brand.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),

      prisma.categories.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: { name: "asc" },
      }),

      prisma.subcategory.findMany({
        select: {
          id: true,
          name: true,
          categoryId: true, // IMPORTANT for dependent dropdown
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        brands,
        categories,
        subcategories,
      },
    });
  } catch (error) {
    console.error("GET Product Filters Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch filter options",
      },
      { status: 500 }
    );
  }
}