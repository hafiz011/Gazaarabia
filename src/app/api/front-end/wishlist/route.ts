import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma:any = new PrismaClient();

//  GET - Fetch user's wishlist

export async function GET(req: Request) {
  try {
    const token = getTokenFromHeader(req);
    const userId = token ? getUserIdFromToken(token) : null;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get pagination params
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 12;
    const skip = (page - 1) * limit;

    //  Get wishlist items with pagination
    const [wishlist, total] = await Promise.all([
      prisma.wishlist.findMany({
        where: { userId },
        include: {
          product: {
            include: {
              productimage: true,
              brand: true,
              categories: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.wishlist.count({
        where: { userId },
      }),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      wishlist,
      total,
      totalPages,
      page,
    });
  } catch (error: any) {
    console.error("Wishlist error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to load wishlist" },
      { status: 500 }
    );
  }
}

// export async function GET(req: Request) {
//   const token:any = getTokenFromHeader(req);
//   const userId = getUserIdFromToken(token);

//   if (!userId) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   const wishlist = await prisma.wishlist.findMany({
//     where: { userId },
//     include: {
//       product: {
//         include: {
//           productimage: true,
//           brand: true,
//           categories: true,
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return NextResponse.json(wishlist);
// }

// POST - Add product to wishlist
export async function POST(req: Request) {
  const token:any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
  }

  const wishlistItem = await prisma.wishlist.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    update: {},
    create: { userId, productId },
  });

  return NextResponse.json(wishlistItem);
}
