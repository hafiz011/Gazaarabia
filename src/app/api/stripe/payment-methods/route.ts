import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { customerId } = await req.json();

        const methods = await stripe.paymentMethods.list({
            customer: customerId,
            type: "card"
        });

        return NextResponse.json({ paymentMethods: methods.data });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Failed to fetch cards" }, { status: 500 });
    }
}
