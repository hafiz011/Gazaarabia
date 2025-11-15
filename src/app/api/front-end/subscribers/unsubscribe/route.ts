import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function POST(req: Request) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json(
            { success: false, message: "Email is required" },
            { status: 400 }
        );
    }

    await prisma.subscriber.update({
        where: { email },
        data: { isActive: false },
    });

    return NextResponse.json({ success: true });
}
