import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getWishlistProductIds } from "@/lib/helpers/wishlist";
import {
  getProductAvailableQuantity,
  getVariantAvailableQuantity,
} from "@/lib/helpers/stockHelper";

const prisma = new PrismaClient();

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

    //  Check if slug is category or subcategory
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
            productvariant: {
              include: { color: true, size: true },
            },
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
            productvariant: {
              include: { color: true, size: true },
            },
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

    // Fetch wishlist IDs once
    let wishlistIdsSet = new Set<number>();
    if (userId) {
      const wishlistIds = await getWishlistProductIds(userId);
      wishlistIdsSet = new Set(wishlistIds);
    }

    //  Enrich products with wishlist + stock in one loop
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const isInWishlist = wishlistIdsSet.has(product.id);

        // Product-level stock
        const productAvailableStock = await getProductAvailableQuantity(product.id);

        // Variant-level stock (parallel)
        const variantsWithStock = await Promise.all(
          product.productvariant.map(async (variant: any) => {
            const variantStock = await getVariantAvailableQuantity(variant.id);
            return { ...variant, availableStock: variantStock };
          })
        );

        return {
          ...product,
          isInWishlist,
          availableStock: productAvailableStock, //  product-level
          productvariant: variantsWithStock, // variants with stock
        };
      })
    );

    //  Final Response
    return NextResponse.json({
      userId,
      products: enrichedProducts,
      total,
      totalPages: Math.ceil(total / limit),
      subcategories,
      parentCategory,
      page,
    });
  } catch (error: any) {
    console.error("Error fetching category products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
