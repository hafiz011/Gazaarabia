import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function PUT(req: Request, { params }: any) {
    try {
        const id = Number(params.id);
        const body = await req.json();

        const updated = await prisma.charityDonations.update({
            where: { id },
            data: {
                paymentStatus: "success",
                paymentMethod: "paypal",
                transactionId: body.transactionId,
            },
        });

        return NextResponse.json({ success: true, updated });
    } catch (e: any) {
        return NextResponse.json(
            { success: false, message: e.message },
            { status: 500 }
        );
    }
}
