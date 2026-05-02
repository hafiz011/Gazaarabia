import { NextResponse } from 'next/server';
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import crypto from 'crypto';


const prisma = new PrismaClient();

/* ============================================================
   GET — Fetch the seller's own profile
   ============================================================ */
export async function GET(req: Request) {
    try {
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
            include: {
                user: {
                    select: { id: true, name: true, email: true, phone: true },
                },
            },
        });

        if (!seller) {
            return NextResponse.json({ message: "Seller profile not found" }, { status: 404 });
        }

        // Stats
        const [totalProducts, totalReviews, reviewAgg] = await Promise.all([
            prisma.products.count({ where: { sellerId: seller.id } }),
            prisma.review.count({ where: { product: { sellerId: seller.id } } }),
            prisma.review.aggregate({
                where: { product: { sellerId: seller.id } },
                _avg: { rating: true },
            }),
        ]);

        const orderItemIds = await prisma.orderItem.findMany({
            where: { sellerId: seller.id },
            select: { orderId: true, sellerEarning: true },
        });
        const totalOrders = new Set(orderItemIds.map(o => o.orderId)).size;
        const totalEarned = orderItemIds.reduce((s, i) => s + i.sellerEarning, 0);

        return NextResponse.json({
            seller: {
                id: seller.id,
                shopName: seller.shopName,
                shopSlug: seller.shopSlug,
                logo: seller.logo,
                banner: seller.banner,
                isActive: seller.isActive,
                status: seller.status,
                commissionValue: seller.commissionValue,
                payoutDays: seller.payoutDays,
                minimumPayout: seller.minimumPayout,
                availableBalance: seller.availableBalance,
                pendingBalance: seller.pendingBalance,
                totalEarned: seller.totalEarned,
                createdAt: seller.createdAt,
                user: seller.user,
            },
            stats: {
                totalProducts,
                totalOrders,
                totalEarned: Number(totalEarned.toFixed(2)),
                totalReviews,
                averageRating: reviewAgg._avg.rating
                    ? Number(reviewAgg._avg.rating.toFixed(1))
                    : 0,
            },
        });
    } catch (error) {
        console.error("SELLER PROFILE GET ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

/* ============================================================
   PATCH — Update the seller's own profile
   ============================================================ */
export async function PATCH(req: Request) {
    try {
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

        const seller = await prisma.seller.findUnique({ where: { userId: user.id } });
        if (!seller) {
            return NextResponse.json({ message: "Seller profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { shopName, logo, banner, name, phone } = body;

        // Update seller record
        const updateSellerData: any = {};
        if (shopName !== undefined) updateSellerData.shopName = shopName;
        // Auto-generate unique slug from shopName if shopName is provided
        if (shopName !== undefined) {
            const slug = `${shopName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}-${crypto.randomUUID().split("-")[0]}`;
            updateSellerData.shopSlug = slug;
        }
        if (logo !== undefined) updateSellerData.logo = logo;
        if (banner !== undefined) updateSellerData.banner = banner;

        // Update user record
        const updateUserData: any = {};
        if (name !== undefined) updateUserData.name = name;
        if (phone !== undefined) updateUserData.phone = phone;

        await Promise.all([
            Object.keys(updateSellerData).length > 0
                ? prisma.seller.update({ where: { id: seller.id }, data: updateSellerData })
                : Promise.resolve(),
            Object.keys(updateUserData).length > 0
                ? prisma.users.update({ where: { id: user.id }, data: updateUserData })
                : Promise.resolve(),
        ]);

        return NextResponse.json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error("SELLER PROFILE PATCH ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
