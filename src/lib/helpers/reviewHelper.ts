import { prisma } from "@/lib/prisma";

/**
 * Get average rating + total reviews for multiple products in a single batch
 */
export async function getBulkProductRatingStats(productIds: number[]) {
    if (productIds.length === 0) return new Map();

    const stats = await prisma.review.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _avg: { rating: true },
        _count: { rating: true },
    });

    const statsMap = new Map();
    stats.forEach(s => {
        statsMap.set(s.productId, {
            averageRating: s._avg.rating ? Number(s._avg.rating.toFixed(1)) : 0,
            totalReviews: s._count.rating || 0
        });
    });

    return statsMap;
}

/**
 * Get average rating + total reviews for a product
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
