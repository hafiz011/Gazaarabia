import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        /* ================= AUTH ================= */
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (!user || user.role?.name.toLowerCase() !== "seller") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const seller = await prisma.seller.findUnique({
            where: { userId: user.id },
        });

        if (!seller) {
            return NextResponse.json({ message: "Seller profile not found" }, { status: 404 });
        }

        /* ================= FETCH REVIEWS ================= */
        const reviews = await prisma.review.findMany({
            where: {
                product: {
                    sellerId: seller.id
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                product: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        productimage: {
                            where: { primary: true },
                            take: 1
                        }
                    }
                }
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        // Format data to match frontend expectations
        const formattedReviews = reviews.map(review => ({
            id: review.id,
            rating: review.rating,
            comment: review.comment,
            image: review.image || "",
            video: review.video || "",
            isPinned: review.isPinned,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            userId: review.userId,
            productId: review.productId,
            product: {
                id: review.product.id,
                title: review.product.title,
                slug: review.product.slug,
                primaryImage: review.product.productimage[0]?.url || "",
            },
            user: {
                id: review.user.id,
                firstName: review.user.name.split(' ')[0] || "User",
                lastName: review.user.name.split(' ').slice(1).join(' ') || "",
                email: review.user.email,
            }
        }));

        return NextResponse.json(formattedReviews);
    } catch (error) {
        console.error("SELLER REVIEWS API ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
