import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

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

        // ── Existing: Categories ──
        const categories = await prisma.categories.findMany({
            where: { id: { in: settings.shopByCategory as number[] } },
            select: { id: true, name: true, slug: true, image: true }
        });

        // ── Existing: Signature Products ──
        const products = await prisma.products.findMany({
            where: { id: { in: settings.signatureProducts as number[] }, isDeleted: false },
            select: {
                id: true,
                title: true,
                slug: true,
                sellingPrice: true,
                productimage: { select: { url: true }, take: 1 }
            }
        });

        // ── Existing: Reviews ──
        const reviews = await prisma.review.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: { select: { name: true } },
            }
        });

        // ── NEW: Trending Products ──
        // If admin picked IDs, use them; otherwise auto-fetch latest 10
        const trendingIds = Array.isArray(settings.trendingProducts) && settings.trendingProducts.length > 0
            ? settings.trendingProducts as number[]
            : null;

        const trendingProducts = trendingIds
            ? await prisma.products.findMany({
                where: { id: { in: trendingIds }, active: true, isDeleted: false },
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
            : await prisma.products.findMany({
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
            });


        // ── NEW: Best Seller Products ──
        // If admin picked IDs, use them; otherwise auto-calc from orders
        const bestSellerIds = Array.isArray(settings.bestSellerProducts) && settings.bestSellerProducts.length > 0
            ? settings.bestSellerProducts as number[]
            : null;

        let bestSellerProducts: any[] = [];

        if (bestSellerIds) {
            bestSellerProducts = await prisma.products.findMany({
                where: { id: { in: bestSellerIds }, active: true, isDeleted: false },
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
        } else {
            // Auto-calculate from order items
            try {
                const topSelling = await prisma.orderItem.groupBy({
                    by: ["productId"],
                    _sum: { quantity: true },
                    orderBy: { _sum: { quantity: "desc" } },
                    take: 12,
                });

                const topProductIds = topSelling.map((item: any) => item.productId);

                if (topProductIds.length > 0) {
                    bestSellerProducts = await prisma.products.findMany({
                        where: { id: { in: topProductIds }, active: true, isDeleted: false },
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
                    const orderMap = new Map(topProductIds.map((id: number, idx: number) => [id, idx]));
                    bestSellerProducts.sort((a: any, b: any) => Number(orderMap.get(a.id) ?? 99) - Number(orderMap.get(b.id) ?? 99));
                }
            } catch {
                // Fallback: just use latest products if no orders yet
                bestSellerProducts = await prisma.products.findMany({
                    where: { active: true, isDeleted: false },
                    orderBy: { createdAt: "desc" },
                    take: 8,
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
            }
        }


        // ── NEW: Shop by Color ──
        const shopByColorIds = Array.isArray(settings.shopByColors) && settings.shopByColors.length > 0
            ? settings.shopByColors as number[]
            : null;

        const shopByColors = shopByColorIds
            ? await prisma.colors.findMany({
                where: { id: { in: shopByColorIds } },
                select: {
                    id: true,
                    name: true,
                    hexCode: true,
                    _count: { select: { productvariant: true } }
                }
            })
            : await prisma.colors.findMany({
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
            });


        return NextResponse.json({
            success: true,
            data: {
                affiliateCommission: settings.affiliateCommission,
                heroSlides: settings.heroSlides,
                shopByCategory: categories,
                midBanner: settings.midBanner,
                signatureProducts: products,
                reviews,
                // NEW sections
                trendingProducts,
                bestSellerProducts,
                shopByColors,
            }
        });

    } catch (error: any) {
        console.error("PUBLIC HOMEPAGE ERROR:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
