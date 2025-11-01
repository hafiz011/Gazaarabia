import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 * 🔹 GET — Fetch a single review by ID
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // ✅ Correct — await the param itself

        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { success: false, message: "Invalid review ID." },
                { status: 400 }
            );
        }

        const userId = await checkAuth(req);
        if (!userId)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // ✅ Ensure admin
        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true },
        });

        if (user?.role?.name.toLowerCase() !== "admin") {
            return NextResponse.json(
                { success: false, message: "Access denied — Admin only." },
                { status: 403 }
            );
        }

        const reviewId = Number(id);
        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, title: true, slug: true } },
            },
        });

        if (!review)
            return NextResponse.json(
                { success: false, message: "Review not found." },
                { status: 404 }
            );

        return NextResponse.json({ success: true, data: review });
    } catch (error) {
        console.error("GET Review Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch review." },
            { status: 500 }
        );
    }
}

/**
 * 🔹 PUT — Update a review by ID
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { success: false, message: "Invalid review ID." },
                { status: 400 }
            );
        }

        const adminId = await checkAuth(req);
        if (!adminId)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // ✅ Ensure admin
        const adminUser = await prisma.users.findUnique({
            where: { id: adminId },
            include: { role: true },
        });

        if (adminUser?.role?.name.toLowerCase() !== "admin") {
            return NextResponse.json(
                { success: false, message: "Access denied — Admin only." },
                { status: 403 }
            );
        }

        const reviewId = Number(id);
        const { rating, comment, userId, productId } = await req.json();

        if (!rating) {
            return NextResponse.json(
                { success: false, message: "Rating is required." },
                { status: 400 }
            );
        }

        const existing = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing)
            return NextResponse.json(
                { success: false, message: "Review not found." },
                { status: 404 }
            );

        const updated = await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating,
                comment: comment || "",
                userId: userId || existing.userId,
                productId: productId || existing.productId,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, title: true, slug: true } },
            },
        });

        return NextResponse.json({
            success: true,
            message: "Review updated successfully.",
            data: updated,
        });
    } catch (error) {
        console.error("PUT Review Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to update review." },
            { status: 500 }
        );
    }
}

/**
 * 🔹 DELETE — Remove a review by ID
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || isNaN(Number(id))) {
            return NextResponse.json(
                { success: false, message: "Invalid review ID." },
                { status: 400 }
            );
        }

        const adminId = await checkAuth(req);
        if (!adminId)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const adminUser = await prisma.users.findUnique({
            where: { id: adminId },
            include: { role: true },
        });

        if (adminUser?.role?.name.toLowerCase() !== "admin") {
            return NextResponse.json(
                { success: false, message: "Access denied — Admin only." },
                { status: 403 }
            );
        }

        const reviewId = Number(id);
        const existing = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing)
            return NextResponse.json(
                { success: false, message: "Review not found." },
                { status: 404 }
            );

        await prisma.review.delete({ where: { id: reviewId } });

        return NextResponse.json({
            success: true,
            message: "Review deleted successfully.",
        });
    } catch (error) {
        console.error("DELETE Review Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to delete review." },
            { status: 500 }
        );
    }
}
