import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const token: any = getTokenFromHeader(req);
        const userId = getUserIdFromToken(token);

        if (!userId)
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Get ambassador record
        const ambassador = await prisma.affiliate.findUnique({
            where: { userId },
        });

        if (!ambassador || ambassador.type !== "ambassador") {
            return NextResponse.json({ message: "Not an ambassador" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const month = searchParams.get("month");

        const filters: any = { ambassadorId: ambassador.id };

        if (status === "paid") filters.isPaid = true;
        if (status === "pending") filters.isPaid = false;
        if (month && month !== "all") filters.monthLabel = month;

        const invoices = await prisma.ambassadorInvoice.findMany({
            where: filters,
            orderBy: { createdAt: "desc" },
        });

        // Summary
        const totalEarned = invoices.reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
        const totalPaid = invoices
            .filter((i: any) => i.isPaid)
            .reduce((sum: number, inv: any) => sum + inv.totalAmount, 0);
        const totalPending = totalEarned - totalPaid;

        return NextResponse.json({
            success: true,
            data: {
                invoices,
                summary: {
                    totalEarned,
                    totalPaid,
                    totalPending,
                },
            },
        });
    } catch (err) {
        console.log(err);
        return NextResponse.json({ message: "Failed to fetch ambassador earnings" }, { status: 500 });
    }
}
