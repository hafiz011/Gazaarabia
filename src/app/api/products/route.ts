import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

// GET all products with search and pagination (Protected)
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where = search
      ? { title: { contains: search, mode: "insensitive" } }
      : {};

    const [total, products] = await Promise.all([
      prisma.products.count({ where }),
      prisma.products.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          brand: true,
          categories: true,
          subcategories: true,
          productimage: true,
          productvariant: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      total,
      page,
      pageSize,
      data: products,
    });
  } catch (error) {
    console.error("GET Products Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
