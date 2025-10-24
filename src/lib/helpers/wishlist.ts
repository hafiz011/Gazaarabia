import { PrismaClient } from "@prisma/client";

const prisma :any= new PrismaClient();

/**
 * ✅ Check if a product is in user's wishlist
 */
export async function isProductInWishlist(userId: number, productId: number): Promise<boolean> {
  if (!userId || !productId) return false;

  const wishlist = await prisma.wishlist.findFirst({
    where: { userId, productId },
    select: { id: true },
  });

  return !!wishlist;
}

/**
 * 🧠 Get all wishlist product IDs for a user
 * (faster when checking multiple products)
 */
export async function getWishlistProductIds(userId: number): Promise<number[]> {
  if (!userId) return [];

  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId },
    select: { productId: true },
  });

  return wishlistItems.map((w:any) => w.productId);
}
