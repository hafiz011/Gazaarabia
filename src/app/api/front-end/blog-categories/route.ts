import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
    try {
        const categories = await prisma.blogCategories.findMany({
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error("GET Categories Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories." },
            { status: 500 }
        );
    }
}
