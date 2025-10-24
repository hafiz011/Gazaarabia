import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma:any = new PrismaClient();

// 🛍️ GET - Fetch user's wishlist
export async function GET(req: Request) {
  const token:any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const wishlist = await prisma.wishlist.findMany({
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
  });

  return NextResponse.json(wishlist);
}

// 🛍️ POST - Add product to wishlist
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
