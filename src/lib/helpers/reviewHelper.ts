// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

import { prisma } from "@/lib/prisma";

/**
 * Get average rating + total reviews for a product
 * @param productId number
 * @returns { averageRating: number, totalReviews: number }
 */
export async function getProductRatingStats(productId: number) {
    const reviewStats = await prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
    });

    return {
        averageRating: reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 0,
        totalReviews: reviewStats._count.rating || 0,
    };
}
