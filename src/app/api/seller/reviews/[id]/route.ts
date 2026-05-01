import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const reviewId = parseInt(id);
        if (isNaN(reviewId)) {
            return NextResponse.json({ message: "Invalid Review ID" }, { status: 400 });
        }

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

        /* ================= VERIFY OWNERSHIP & UPDATE ================= */
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                product: true
            }
        });

        if (!review) {
            return NextResponse.json({ message: "Review not found" }, { status: 404 });
        }

        if (review.product.sellerId !== seller.id) {
            return NextResponse.json({ message: "Unauthorized to pin this review" }, { status: 403 });
        }

        const body = await req.json();
        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
                isPinned: body.isPinned ?? !review.isPinned
            }
        });

        return NextResponse.json(updatedReview);
    } catch (error) {
        console.error("PIN REVIEW ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
