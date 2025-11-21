import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
    try {
        const { customerId } = await req.json();

        if (!customerId) {
            return NextResponse.json(
                { error: "Missing customerId" },
                { status: 400 }
            );
        }

        // Get saved cards
        const paymentMethods = await stripe.paymentMethods.list({
            customer: customerId,
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
