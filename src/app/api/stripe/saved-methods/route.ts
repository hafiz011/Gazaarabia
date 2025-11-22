import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

export async function GET(req: Request) {
    try {
        // 1. Get JWT from header
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Fetch user & Stripe customer ID
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (!user.stripeCustomerId) {
            return NextResponse.json({
                success: true,
                paymentMethods: []
            });
        }

        // 3. Fetch saved cards
        const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
            type: "card",
        });

        return NextResponse.json({
            success: true,
            paymentMethods: paymentMethods.data,
        });

    } catch (error: any) {
        console.error("Error fetching saved cards:", error.message);

        return NextResponse.json(
            { error: "Unable to fetch saved payment methods" },
            { status: 500 }
        );
    }
}
