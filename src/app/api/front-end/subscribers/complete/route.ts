import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSubscribeConfirmationEmail } from "@/lib/helpers/emailHelper";

const prisma: any = new PrismaClient();

export async function POST(req: Request) {
    const { email, name, phone } = await req.json();

    if (!email || !name || !phone) {
        return NextResponse.json(
            { success: false, message: "All fields are required" },
            { status: 400 }
        );
    }

    const subscriber = await prisma.subscriber.update({
        where: { email },
        data: { name, phone, isActive: true },
    });

    const emailRes = await sendSubscribeConfirmationEmail({
        to: subscriber.email,
        name: subscriber.name,
    });

    return NextResponse.json({ success: true, emailRes });
}


