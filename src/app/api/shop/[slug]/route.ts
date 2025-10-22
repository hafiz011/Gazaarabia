import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

/**
 * GET /api/shop/[slug]?page=1&limit=12
 * - If slug is category → return its subcategories and category products
 * - If slug is subcategory → return its siblings, subcategory products & parent category
 */

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;
  const skip = (page - 1) * limit;

  try {
    // ✅ Check if slug belongs to a Category
    const category = await prisma.categories.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    let products = [];
    let total = 0;
    let subcategories = [];
    let parentCategory = null;

    if (category) {
      // 👉 If it's a category
      [products, total, subcategories] = await Promise.all([
        prisma.products.findMany({
          where: { categoryId: category.id },
          include: {
            productimage: true,
            productvariant: {
              include: {
                color: true, // ✅ Return color details here
              },
            },
            brand: true,
            categories: true,
            subcategories: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.products.count({
          where: { categoryId: category.id },
        }),
        prisma.subcategory.findMany({
          where: { categoryId: category.id },
          orderBy: { name: "asc" },
        }),
      ]);

      // For a category, parentCategory will just be itself
      parentCategory = category;
    } else {
      // ✅ Else check if slug belongs to a Subcategory
      const subcategory = await prisma.subcategory.findUnique({
        where: { slug },
        select: { id: true, categoryId: true, name: true, slug: true },
      });

      if (subcategory) {
        [products, total, subcategories] = await Promise.all([
          prisma.products.findMany({
            where: { subcategoryId: subcategory.id },
            include: {
              productimage: true,
              productvariant: {
                include: {
                  color: true, // ✅ Return color details here too
                },
              },
              brand: true,
              categories: true,
              subcategories: true,
            },
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
          }),
          prisma.products.count({
            where: { subcategoryId: subcategory.id },
          }),
          prisma.subcategory.findMany({
            where: { categoryId: subcategory.categoryId },
            orderBy: { name: "asc" },
          }),
        ]);

        // 👇 Fetch the parent category of this subcategory
        parentCategory = await prisma.categories.findUnique({
          where: { id: subcategory.categoryId },
          select: { id: true, name: true, slug: true },
        });
      } else {
        return NextResponse.json(
          { error: "Invalid category or subcategory slug" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json({
      products,
      total,
      totalPages: Math.ceil(total / limit),
      subcategories,
      parentCategory,
      page,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
