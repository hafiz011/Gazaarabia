import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getWishlistProductIds } from "@/lib/helpers/wishlist";
import {
  getProductAvailableQuantity,
  getVariantAvailableQuantity,
} from "@/lib/helpers/stockHelper";
import { getProductRatingStats } from "@/lib/helpers/reviewHelper";

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const { searchParams } = new URL(req.url);

  /* ---------------- Pagination ---------------- */
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 12;
  const skip = (page - 1) * limit;

  /* ---------------- Filters ---------------- */
  const priceMin = Number(searchParams.get("priceMin")) || 0;
  const priceMax = Number(searchParams.get("priceMax")) || 100000;

  const availability = searchParams.getAll("availability[]"); // ["In stock"]
  const sizes = searchParams.getAll("sizes[]").map(Number);
  const colors = searchParams.getAll("colors[]").map(Number);
  const subcategoriesFilter = searchParams
    .getAll("subcategories[]")
    .map(Number);

  const sort = searchParams.get("sort") || "new";

  /* ---------------- Auth ---------------- */
  const token = getTokenFromHeader(req);
  const userId = token ? getUserIdFromToken(token) : null;

  try {
    /* ---------------- Availability (baseQty) ---------------- */
    const hasInStock = availability.includes("In stock");
    const hasOutOfStock = availability.includes("Out of stock");

    /* ---------------- Build WHERE ---------------- */
    const productWhere: any = {
      active: true,
      sellingPrice: {
        gte: priceMin,
        lte: priceMax,
      },
    };

    // baseQty stock filter
    if (hasInStock && !hasOutOfStock) {
      productWhere.baseQty = { gt: 0 };
    }

    if (hasOutOfStock && !hasInStock) {
      productWhere.baseQty = { lte: 0 };
    }

    // Subcategory filter (from filter panel)
    if (subcategoriesFilter.length > 0) {
      productWhere.subcategoryId = { in: subcategoriesFilter };
    }

    // Size / Color (variant based)
    if (sizes.length > 0 || colors.length > 0) {
      productWhere.productvariant = {
        some: {
          isActive: true,
          ...(sizes.length > 0 && { sizeId: { in: sizes } }),
          ...(colors.length > 0 && { colorId: { in: colors } }),
        },
      };
    }

    /* ---------------- Sorting ---------------- */
    let orderBy: any = { createdAt: "desc" }; // default = New arrivals

    if (sort === "price_asc") {
      orderBy = { sellingPrice: "asc" };
    }

    if (sort === "price_desc") {
      orderBy = { sellingPrice: "desc" };
    }

    if (sort === "bestseller") {
      orderBy = { soldCount: "desc" }; // uses products.soldCount
    }

    /* ---------------- Category / Subcategory ---------------- */
    let products: any[] = [];
    let total = 0;
    let subcategories: any[] = [];
    let parentCategory: any = null;

    const category = await prisma.categories.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (category) {
      [products, total, subcategories] = await Promise.all([
        prisma.products.findMany({
          where: {
            categoryId: category.id,
            ...productWhere,
          },
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
          orderBy,
        }),
        prisma.products.count({
          where: {
            categoryId: category.id,
            ...productWhere,
          },
        }),
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
          where: {
            subcategoryId: subcategory.id,
            ...productWhere,
          },
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
          orderBy,
        }),
        prisma.products.count({
          where: {
            subcategoryId: subcategory.id,
            ...productWhere,
          },
        }),
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

    /* ---------------- Wishlist ---------------- */
    let wishlistIdsSet = new Set<number>();
    if (userId) {
      const wishlistIds = await getWishlistProductIds(userId);
      wishlistIdsSet = new Set(wishlistIds);
    }

    /* ---------------- Enrich products ---------------- */
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        const isInWishlist = wishlistIdsSet.has(product.id);

        const productAvailableStock =
          await getProductAvailableQuantity(product.id);

        const variantsWithStock = await Promise.all(
          product.productvariant.map(async (variant: any) => {
            const variantStock =
              await getVariantAvailableQuantity(variant.id);
            return { ...variant, availableStock: variantStock };
          })
        );

        const { averageRating, totalReviews } =
          await getProductRatingStats(product.id);

        return {
          ...product,
          isInWishlist,
          availableStock: productAvailableStock,
          productvariant: variantsWithStock,
          rating: averageRating,
          reviewsCount: totalReviews,
        };
      })
    );

    /* ---------------- Response ---------------- */
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
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
