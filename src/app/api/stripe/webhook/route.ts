import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { pushExternalItemsForOrder } from "@/lib/orderPush";


export async function POST(req: Request) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");


    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // PAYMENT SUCCESS
    if (event.type === "payment_intent.succeeded") {
        const pi = event.data.object;
        const orderId = pi.metadata?.orderId;

        // Order ids whose external-store items should be forwarded once paid.
        const paidOrderIds: number[] = [];

        if (orderId && orderId !== "pending" && !isNaN(Number(orderId))) {
            // Standard flow: update by ID
            await prisma.orders.update({
                where: { id: Number(orderId) },
                data: {
                    status: "paid",
                    transactionId: pi.id,
                    paymentMethod: "stripe",
                },
            });
            paidOrderIds.push(Number(orderId));
        } else {
            // Fallback flow: update by transactionId (PaymentIntent ID)
            // This handles the race condition where metadata isn't updated yet
            await prisma.orders.updateMany({
                where: { transactionId: pi.id },
                data: {
                    status: "paid",
                    paymentMethod: "stripe",
                },
            });
            const orders = await prisma.orders.findMany({
                where: { transactionId: pi.id },
                select: { id: true },
            });
            paidOrderIds.push(...orders.map((o) => o.id));
        }

        //  Forward external-store (Shopify/WooCommerce) items now that payment
        //  is confirmed. Idempotent, so a duplicate webhook delivery is safe.
        for (const id of paidOrderIds) {
            try {
                await pushExternalItemsForOrder(id);
            } catch (e) {
                console.error("External store push failed:", (e as Error).message);
            }
        }
    }

    return NextResponse.json({ received: true });
}
