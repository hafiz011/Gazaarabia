import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma: any = new PrismaClient();

export async function GET() {
    try {
        const receipts = await prisma.solidarityReceipts.findMany({
            orderBy: { id: "desc" },
            select: {
                id: true,
                title: true,
                description: true,
                receiptImage: true,
                amount: true,
                createdAt: true,
                
            }
        });

        return NextResponse.json({
            success: true,
            data: receipts
        });
    } catch (error) {
        console.error("Public receipts fetch error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to load receipts."
        }, { status: 500 });
    }
}
