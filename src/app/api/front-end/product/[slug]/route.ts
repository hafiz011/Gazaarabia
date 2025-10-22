import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  try {
    // ✅ Get product details by slug and include its material care directly
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        productimage: true,
        productvariant: {
          include: {
            color: true,
          },
        },
        brand: true,
        categories: true,
        subcategories: true,
        materialCare: true, // 👈 This will fetch only the linked material care
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Return product + only its material care data
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("❌ Error fetching product by slug:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
