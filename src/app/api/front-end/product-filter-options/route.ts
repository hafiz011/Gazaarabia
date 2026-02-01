import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [colors, sizes, categories, subcategories] = await Promise.all([
      prisma.colors.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.sizes.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.categories.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.subcategory.findMany({
        orderBy: { name: "asc" },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        colors,
        sizes,
        categories,
        subcategories,
      },
    });
  } catch (error) {
    console.error("Product meta fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product options" },
      { status: 500 }
    );
  }
}
