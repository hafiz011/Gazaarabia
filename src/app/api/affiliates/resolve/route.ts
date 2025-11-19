import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const ref = req.nextUrl.searchParams.get("ref");

        if (!ref) {
            return NextResponse.json({ success: false, message: "Missing referral code" });
        }

        const affiliate = await prisma.affiliate.findUnique({
            where: { referralCode: ref },
            select: {
                id: true,
                referralCode: true,
                baseCommission: true,
                shareCommission: true,
                isActive: true,
            },
        });

        if (!affiliate || !affiliate.isActive) {
            return NextResponse.json({ success: false, message: "Invalid or inactive referral code" });
        }

        return NextResponse.json({
            success: true,
            affiliate,
        });
    } catch (err) {
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}
