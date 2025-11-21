import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { amount, customerId } = await req.json();

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),  // £ to pence
            currency: "gbp",
            customer: customerId,
            // automatic_payment_methods: { enabled: true },
            payment_method_types: ["card"],

            // Save card after payment
            setup_future_usage: "off_session",
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to create PaymentIntent" }, { status: 500 });
    }
}
