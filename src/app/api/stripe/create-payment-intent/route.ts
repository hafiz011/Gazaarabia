import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { amount } = body;

        if (!amount) {
            return NextResponse.json(
                { error: "Missing amount" },
                { status: 400 }
            );
        }

        //  1. Authenticate user
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        let customerId: string | undefined = undefined;

        if (userId) {
            // Logged-in user: safely fetch Stripe customerId from DB
            const user = await prisma.users.findUnique({
                where: { id: userId },
                select: { stripeCustomerId: true }
            });

            customerId = user?.stripeCustomerId || undefined;
        }

        //  2. Create secure PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "gbp",

            customer: customerId ?? undefined,

            automatic_payment_methods: {
                enabled: true,
            },

            // Save card only if logged in
            setup_future_usage: customerId ? "off_session" : undefined,

            metadata: {
                orderId: "pending",
                createdBy: userId ? `user_${userId}` : "guest"
            }
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            customerEnabled: !!customerId
        });

    } catch (err: any) {
        console.error("PaymentIntent error:", err);
        return NextResponse.json(
            { error: err.message || "Failed to create PaymentIntent" },
            { status: 500 }
        );
    }
}
