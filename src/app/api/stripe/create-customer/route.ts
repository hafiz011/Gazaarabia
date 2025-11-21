import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma"; // your Prisma instance

export async function POST(req: Request) {
    try {
        const { userId } = await req.json();

        const user: any = await prisma.users.findUnique({ where: { id: userId } });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Already exists
        if (user.stripeCustomerId) {
            return NextResponse.json({ customerId: user.stripeCustomerId });
        }

        // Create new customer
        const customer = await stripe.customers.create({
            email: user.email,
            name: user.name
        });

        // Save it in DB
        await prisma.users.update({
            where: { id: userId },
            data: { stripeCustomerId: customer.id }
        });

        return NextResponse.json({ customerId: customer.id });

    } catch (err) {
        console.error("Stripe customer error:", err);
        return NextResponse.json({ error: "Customer creation failed" }, { status: 500 });
    }
}
