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

        /* ================= FETCH CUSTOMERS ================= */

        // Find users who have ordered this seller's products
        const customersRaw = await prisma.users.findMany({
            where: {
                orders: {
                    some: {
                        orderItems: {
                            some: { sellerId: seller.id }
                        }
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                createdAt: true,
                orders: {
                    where: {
                        orderItems: {
                            some: { sellerId: seller.id }
                        }
                    },
                    select: {
                        id: true,
                        totalAmount: true,
                        createdAt: true,
                        orderItems: {
                            where: { sellerId: seller.id },
                            select: {
                                subtotal: true,
                                quantity: true
                            }
                        }
                    }
                }
            }
        });

        const formattedCustomers = customersRaw.map(customer => {
            const totalSpent = customer.orders.reduce((acc, order) => {
                const sellerItemsTotal = order.orderItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
                return acc + sellerItemsTotal;
            }, 0);

            const lastOrderDate = customer.orders.length > 0
                ? customer.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
                : null;

            return {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                memberSince: customer.createdAt,
                totalOrders: customer.orders.length,
                totalSpent: Number(totalSpent.toFixed(2)),
                lastOrderDate: lastOrderDate
            };
        });

        return NextResponse.json(formattedCustomers);
    } catch (error) {
        console.error("SELLER CUSTOMERS API ERROR:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
