import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { isProductInWishlist } from "@/lib/helpers/wishlist";

const prisma: any = new PrismaClient();

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  //Get userId if logged in
  const token = getTokenFromHeader(req);
  const userId = token ? getUserIdFromToken(token) : null;

  try {
    //  Get product details by slug and include material care
    const product = await prisma.products.findUnique({
      where: { slug },
      include: {
        productimage: true,
        productvariant: {
          include: {
            color: true,
            size: true,
          },
        },
        brand: true,
        categories: true,
        subcategories: true,
        materialCare: true,


         //  Include reviews and user info
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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

        //  2. Get aggregate review data
    const reviewStats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = reviewStats._avg.rating || 0;
    const totalReviews = reviewStats._count.id;


    //  Check if this product is in the user's wishlist
    let isInWishlist = false;
    if (userId) {
      isInWishlist = await isProductInWishlist(userId, product.id);
    }

    return NextResponse.json({
      ...product,
      reviewsData: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        list: product.reviews, // all reviews with user info
      }, 
      isInWishlist,
    });
  } catch (error: any) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
