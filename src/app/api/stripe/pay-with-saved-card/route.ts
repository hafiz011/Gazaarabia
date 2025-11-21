import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { amount, customerId, paymentMethodId } = await req.json();

        const intent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: "gbp",
            customer: customerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
        });

        return NextResponse.json({ success: true, intent });

    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }
}
