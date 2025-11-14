import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const donation = await prisma.charityDonations.create({
            data: {
                name: body.name || null,
                email: body.email,
                amount: body.amount,
                message: body.message || null,
                anonymous: body.anonymous || false,
                paymentStatus: "pending",
            },
        });

        return NextResponse.json({ success: true, data: donation });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
