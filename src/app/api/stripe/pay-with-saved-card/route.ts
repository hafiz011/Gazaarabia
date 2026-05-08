import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

export async function POST(req: Request) {
    try {
        // 1. Auth
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { amount, paymentMethodId } = body;

        if (!amount || !paymentMethodId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 2. Fetch user & customerId
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { stripeCustomerId: true }
        });

        if (!user || !user.stripeCustomerId) {
            return NextResponse.json({ error: "Stripe customer not found" }, { status: 400 });
        }

        // Get origin for return_url
        const origin = req.headers.get("origin") || req.headers.get("referer")?.split("/").slice(0, 3).join("/") || "http://localhost:3000";
        const returnUrl = `${origin}/payment/callback`;

        // 3. Charge saved card
        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "gbp",
            customer: user.stripeCustomerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            // payment_method_types: ["card"],

            
            // return_url is REQUIRED for off-session payments that need 3D Secure
            return_url: returnUrl,
            metadata: {
                orderId: "pending",
                userId: String(userId)
            },
        });

        // Check if 3D Secure authentication is required
        if (intent.status === "requires_confirmation" || intent.status === "requires_payment_method") {
            return NextResponse.json({
                success: false,
                requiresAction: true,
                clientSecret: intent.client_secret,
                message: "3D Secure authentication required"
            });
        }

        return NextResponse.json({ success: true, intent });

    } catch (err: any) {
        console.error("Stripe charge error:", err);

        // Stripe-specific error handling
        if (err.type === "StripeCardError") {
            return NextResponse.json(
                { error: err.message, decline_code: err.decline_code },
                { status: 400 }
            );
        }

        if (err.code === "authentication_required") {
            return NextResponse.json(
                {
                    error: "3D Secure required",
                    payment_intent_client_secret: err.payment_intent.client_secret,
                    payment_intent_id: err.payment_intent.id
                },
                { status: 403 }
            );
        }

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
