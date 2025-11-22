import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

export async function POST(req: Request) {
    try {
        // 1. Authenticate
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Fetch user from DB
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                stripeCustomerId: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 3. If already exists, return it
        if (user.stripeCustomerId) {
            return NextResponse.json({ customerId: user.stripeCustomerId });
        }

        // 4. Create stripe customer
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name,
            metadata: {
                userId: String(user.id)
            }
        });

        // 5. Save customerId in DB
        await prisma.users.update({
            where: { id: user.id },
            data: { stripeCustomerId: customer.id }
        });

        return NextResponse.json({ customerId: customer.id });

    } catch (err: any) {
        console.error("Stripe customer error:", err.message);
        return NextResponse.json(
            { error: "Customer creation failed" },
            { status: 500 }
        );
    }
}
