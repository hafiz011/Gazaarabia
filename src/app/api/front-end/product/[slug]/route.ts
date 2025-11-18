import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { isProductInWishlist } from "@/lib/helpers/wishlist";
import { getProductAvailableQuantity, getVariantAvailableQuantity } from "@/lib/helpers/stockHelper";

const prisma: any = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  //  Get userId if logged in
  const token = getTokenFromHeader(req);
  const userId = token ? getUserIdFromToken(token) : null;

  try {
    //  Get product details
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        productimage: true,
        productvariant: {
          include: {
            color: true,
            size: true,
            variantImages: true,
          },
        },
        brand: true,
        categories: true,
        subcategories: true,
        materialCare: true,
        reviews: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        asParentRelations: {
          where: { relationType: "wear_with" },
          include: {
            child: {
              include: {
                productimage: true,
                brand: true,
                productvariant: {
                  include: {
                    color: true,
                    size: true,
                    variantImages: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    //  Get product-level available stock
    const productAvailableQty = await getProductAvailableQuantity(product.id);

    //  For each variant, fetch available stock in parallel
    const variantsWithStock = await Promise.all(
      product.productvariant.map(async (variant: any) => {
        const availableQty = await getVariantAvailableQuantity(variant.id);
        return { ...variant, availableStock: availableQty };
      })
    );

    // Aggregate review data
    const reviewStats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = reviewStats._avg.rating || 0;
    const totalReviews = reviewStats._count.id;

    //  Check if main product is in wishlist
    let isInWishlist = false;
    if (userId) {
      isInWishlist = await isProductInWishlist(userId, product.id);
    }

    //  Flatten wear_with data
    const wearWithRaw = product.asParentRelations.map((r: any) => r.child);
    delete product.asParentRelations;

    //  Add wishlist info to each wearWith product
    let wearWith = wearWithRaw;

    if (userId && wearWithRaw.length > 0) {
      // Run all wishlist checks in parallel
      const wearWithStatuses = await Promise.all(
        wearWithRaw.map(async (p: any) => {
          const inWishlist = await isProductInWishlist(userId, p.id);
          return { ...p, isInWishlist: inWishlist };
        })
      );
      wearWith = wearWithStatuses;
    } else {
      // If not logged in, just mark all false
      wearWith = wearWithRaw.map((p: any) => ({
        ...p,
        isInWishlist: false,
      }));
    }


    // Fetch delivery settings (id = 1 always)
    const deliverySettings = await prisma.deliverySettings.findUnique({
      where: { id: 1 },
    });


    //  Return clean, structured response
    return NextResponse.json({
      ...product,
      productvariant: variantsWithStock,      //  include stock per variant
      availableStock: productAvailableQty,    //  include total product-level stock
      wearWith,
      reviewsData: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        list: product.reviews,
      },
      isInWishlist,
      deliverySettings
    });
  } catch (error: any) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
