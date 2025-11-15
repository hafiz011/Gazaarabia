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
                    signatureProducts: []
                }
            });
        }

        const categories = await prisma.categories.findMany({
            where: { id: { in: settings.shopByCategory as number[] } },
            select: { id: true, name: true, slug: true, image: true }
        });

        const products = await prisma.products.findMany({
            where: { id: { in: settings.signatureProducts as number[] } },
            select: {
                id: true,
                title: true,
                slug: true,
                sellingPrice: true,
                productimage: { select: { url: true }, take: 1 }
            }
        });


        //  Fetch Latest Reviews to Show on Homepage
        const reviews = await prisma.review.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                rating: true,
                comment: true,
                createdAt: true,
                user: { select: { name: true } },
                // product: {
                //     select: {
                //         id: true,
                //         title: true,
                //         slug: true,
                //         productimage: { select: { url: true }, take: 1 }
                //     }
                // }
            }
        });


        return NextResponse.json({
            success: true,
            data: {
                affiliateCommission: settings.affiliateCommission,
                heroSlides: settings.heroSlides,
                shopByCategory: categories,
                midBanner: settings.midBanner,
                signatureProducts: products,
                reviews
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
