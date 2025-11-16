import { prisma } from "@/lib/prisma";

/**
 * Get review details for a given order item.
 *
 * @param orderItemId - The ID of the order item.
 * @param userId - Optional user ID (to filter for a specific customer's review).
 * @returns Review details including rating, comment, and product info.
 */
export async function getReviewDetails(orderItemId: number) {
  if (!orderItemId) return null;

  try {
    const review = await prisma.review.findFirst({
      where: {
        orderItemId
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
        product: {
          select: {
            id: true,
            title: true,
            productimage: { select: { url: true }, take: 1 },
          },
        },
        variant: {
          select: {
            id: true,
            sku: true,
            color: { select: { name: true } },
            size: { select: { name: true } },
          },
        },
      },
    });

    if (!review) return null;

    return {
      ...review,
      reviewed: true,
    };
  } catch (error) {
    console.error("Error fetching review details:", error);
    return null;
  }
}
