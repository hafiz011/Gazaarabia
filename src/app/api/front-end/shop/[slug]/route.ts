import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getWishlistProductIds } from "@/lib/helpers/wishlist";

const prisma: any = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;
  const skip = (page - 1) * limit;

  const token = getTokenFromHeader(req);
  const userId = token ? getUserIdFromToken(token) : null;

  try {
    let products: any[] = [];
    let total = 0;
    let subcategories: any[] = [];
    let parentCategory: any = null;

    // Check if slug is category or subcategory
    const category = await prisma.categories.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (category) {
      [products, total, subcategories] = await Promise.all([
        prisma.products.findMany({
          where: { categoryId: category.id },
          include: {
            productimage: true,
            productvariant: { include: { color: true } },
            brand: true,
            categories: true,
            subcategories: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.products.count({ where: { categoryId: category.id } }),
        prisma.subcategory.findMany({
          where: { categoryId: category.id },
          orderBy: { name: "asc" },
        }),
      ]);

      parentCategory = category;
    } else {
      const subcategory = await prisma.subcategory.findUnique({
        where: { slug },
        select: { id: true, categoryId: true, name: true, slug: true },
      });

      if (!subcategory) {
        return NextResponse.json(
          { error: "Invalid category or subcategory slug" },
          { status: 404 }
        );
      }

      [products, total, subcategories] = await Promise.all([
        prisma.products.findMany({
          where: { subcategoryId: subcategory.id },
          include: {
            productimage: true,
            productvariant: { include: { color: true } },
            brand: true,
            categories: true,
            subcategories: true,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.products.count({ where: { subcategoryId: subcategory.id } }),
        prisma.subcategory.findMany({
          where: { categoryId: subcategory.categoryId },
          orderBy: { name: "asc" },
        }),
      ]);

      parentCategory = await prisma.categories.findUnique({
        where: { id: subcategory.categoryId },
        select: { id: true, name: true, slug: true },
      });
    }

    //  Wishlist check (using helper)
    if (userId) {
      const wishlistIds = await getWishlistProductIds(userId);
      products = products.map((p) => ({
        ...p,
        isInWishlist: wishlistIds.includes(p.id),
      }));
    } else {
      products = products.map((p) => ({
        ...p,
        isInWishlist: false,
      }));
    }

    return NextResponse.json({
      userId,
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
