import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const settings = await prisma.homePageSetting.findFirst();

        if (!settings) {
            return NextResponse.json({
                success: true,
                data: {
                    heroSlides: [],
                    shopByCategory: [],
                    midBanner: null,
                    signatureProducts: [],
                    trendingProducts: [],
                    bestSellerProducts: [],
                    shopByColors: [],
                }
            });
        }

        // Parallelize all independent queries (Phase 1)
        const [
            categories,
            signatureProducts,
            reviews,
            trendingProducts,
            bestSellersAutoIds,
            shopByColors
        ] = await Promise.all([
            // Categories
            prisma.categories.findMany({
                where: { id: { in: settings.shopByCategory as number[] } },
                select: { id: true, name: true, slug: true, image: true }
            }),

            // Signature Products
            prisma.products.findMany({
                where: { id: { in: settings.signatureProducts as number[] }, isDeleted: false },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sellingPrice: true,
                    productimage: { select: { url: true }, take: 1 }
                }
            }),

            // Reviews
            prisma.review.findMany({
                take: 10,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    rating: true,
                    comment: true,
                    createdAt: true,
                    user: { select: { name: true } },
                }
            }),

            // Trending Products
            settings.trendingProducts && (settings.trendingProducts as number[]).length > 0
                ? prisma.products.findMany({
                    where: { id: { in: settings.trendingProducts as number[] }, active: true, isDeleted: false },
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        sellingPrice: true,
                        discountPrice: true,
                        productimage: { select: { url: true }, take: 2 },
                        productvariant: {
                            select: {
                                id: true,
                                color: { select: { id: true, name: true, hexCode: true } }
                            },
                            distinct: ['colorId'],
                            take: 4,
                        },
                    }
                })
                : prisma.products.findMany({
                    where: { active: true, isDeleted: false },
                    orderBy: { createdAt: "desc" },
                    take: 12,
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        sellingPrice: true,
                        discountPrice: true,
                        productimage: { select: { url: true }, take: 2 },
                        productvariant: {
                            select: {
                                id: true,
                                color: { select: { id: true, name: true, hexCode: true } }
                            },
                            distinct: ['colorId'],
                            take: 4,
                        },
                    }
                }),

            // Best Seller Auto-lookup (Phase 1 Aggregation)
            (!settings.bestSellerProducts || (settings.bestSellerProducts as number[]).length === 0)
                ? prisma.orderItem.groupBy({
                    by: ["productId"],
                    _sum: { quantity: true },
                    orderBy: { _sum: { quantity: "desc" } },
                    take: 12,
                })
                : Promise.resolve([]),

            // Shop by Color
            settings.shopByColors && (settings.shopByColors as number[]).length > 0
                ? prisma.colors.findMany({
                    where: { id: { in: settings.shopByColors as number[] } },
                    select: {
                        id: true,
                        name: true,
                        hexCode: true,
                        _count: { select: { productvariant: true } }
                    }
                })
                : prisma.colors.findMany({
                    where: {
                        productvariant: {
                            some: {
                                products: { active: true }
                            }
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        hexCode: true,
                        _count: { select: { productvariant: true } }
                    },
                    take: 12,
                })
        ]);

        // Process Best Sellers
        let finalBestSellers: any[] = [];
        const manualBestSellerIds = settings.bestSellerProducts as number[];

        if (manualBestSellerIds && manualBestSellerIds.length > 0) {
            finalBestSellers = await prisma.products.findMany({
                where: { id: { in: manualBestSellerIds }, active: true, isDeleted: false },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sellingPrice: true,
                    discountPrice: true,
                    productimage: { select: { url: true }, take: 2 },
                    productvariant: {
                        select: {
                            id: true,
                            color: { select: { id: true, name: true, hexCode: true } }
                        },
                        distinct: ['colorId'],
                        take: 4,
                    },
                }
            });
        } else if (bestSellersAutoIds.length > 0) {
            const topIds = bestSellersAutoIds.map((item: any) => item.productId);
            finalBestSellers = await prisma.products.findMany({
                where: { id: { in: topIds }, active: true, isDeleted: false },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    sellingPrice: true,
                    discountPrice: true,
                    productimage: { select: { url: true }, take: 2 },
                    productvariant: {
                        select: {
                            id: true,
                            color: { select: { id: true, name: true, hexCode: true } }
                        },
                        distinct: ['colorId'],
                        take: 4,
                    },
                }
            });
            // Sort by sales volume order
            const orderMap = new Map(topIds.map((id: number, idx: number) => [id, idx]));
            finalBestSellers.sort((a: any, b: any) => Number(orderMap.get(a.id) ?? 99) - Number(orderMap.get(b.id) ?? 99));
        }

        const response = NextResponse.json({
            success: true,
            data: {
                affiliateCommission: settings.affiliateCommission,
                heroSlides: settings.heroSlides,
                shopByCategory: categories,
                midBanner: settings.midBanner,
                signatureProducts: signatureProducts,
                reviews,
                trendingProducts,
                bestSellerProducts: finalBestSellers,
                shopByColors,
            }
        });

        // Add Cache-Control for enterprise scalability (Phase 7)
        response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

        return response;

    } catch (error: any) {
        console.error("PUBLIC HOMEPAGE ERROR:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
