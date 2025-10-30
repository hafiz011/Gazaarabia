// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
// import { isProductInWishlist } from "@/lib/helpers/wishlist";

// const prisma: any = new PrismaClient();

// export async function GET(
//   req: Request,
//   context: { params: Promise<{ slug: string }> }
// ) {
//   const { slug } = await context.params;

//   //Get userId if logged in
//   const token = getTokenFromHeader(req);
//   const userId = token ? getUserIdFromToken(token) : null;

//   try {
//     //  Get product details by slug and include material care
//     const product = await prisma.products.findUnique({
//       where: { slug },
//       include: {
//         productimage: true,
//         productvariant: {
//           include: {
//             color: true,
//             size: true,
//             variantImages: true,
//           },
//         },
//         brand: true,
//         categories: true,
//         subcategories: true,
//         materialCare: true,


//         //  Include reviews and user info
//         reviews: {
//           include: {
//             user: {
//               select: {
//                 id: true,
//                 name: true,
//                 email: true
//               },
//             },
//           },
//           orderBy: {
//             createdAt: "desc",
//           },
//         },

//         //Include Wear With Products (this was misplaced before)
//         asParentRelations: {
//           where: { relationType: "wear_with" },
//           include: {
//             child: {
//               include: {
//                 productimage: true,
//                 brand: true,
//                 productvariant: {
//                   include: {
//                     color: true,
//                     size: true,
//                     variantImages: true,
//                   },
//                 },
//               },
//             },
//           },
//         },


//       },
//     });

//     if (!product) {
//       return NextResponse.json(
//         { error: "Product not found" },
//         { status: 404 }
//       );
//     }

//     //  2. Get aggregate review data
//     const reviewStats = await prisma.review.aggregate({
//       where: { productId: product.id },
//       _avg: { rating: true },
//       _count: { id: true },
//     });

//     const averageRating = reviewStats._avg.rating || 0;
//     const totalReviews = reviewStats._count.id;


//     //  Check if this product is in the user's wishlist
//     let isInWishlist = false;
//     if (userId) {
//       isInWishlist = await isProductInWishlist(userId, product.id);
//     }


//     // ✅ Flatten wear_with data
//     const wearWith = product.asParentRelations.map((r: any) => r.child);
//     delete product.asParentRelations;

//     return NextResponse.json({
//       ...product,
//       wearWith,
//       reviewsData: {
//         averageRating: Number(averageRating.toFixed(1)),
//         totalReviews,
//         list: product.reviews, // all reviews with user info
//       },
//       isInWishlist,
//     });
//   } catch (error: any) {
//     console.error("Error fetching product by slug:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to fetch product" },
//       { status: 500 }
//     );
//   }
// }

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

  // 🧩 Get userId if logged in
  const token = getTokenFromHeader(req);
  const userId = token ? getUserIdFromToken(token) : null;

  try {
    // 🟢 Get product details
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

    // 🟡 Aggregate review data
    const reviewStats = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { id: true },
    });

    const averageRating = reviewStats._avg.rating || 0;
    const totalReviews = reviewStats._count.id;

    // 🧠 Check if main product is in wishlist
    let isInWishlist = false;
    if (userId) {
      isInWishlist = await isProductInWishlist(userId, product.id);
    }

    // 🧩 Flatten wear_with data
    const wearWithRaw = product.asParentRelations.map((r: any) => r.child);
    delete product.asParentRelations;

    // 🧠 Add wishlist info to each wearWith product
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

    // ✅ Return clean, structured response
    return NextResponse.json({
      ...product,
      wearWith,
      reviewsData: {
        averageRating: Number(averageRating.toFixed(1)),
        totalReviews,
        list: product.reviews,
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
