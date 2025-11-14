import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/* ---------------------------------------------------
   POST - Create Solidarity Receipt (Admin Only)
--------------------------------------------------- */
export async function POST(req: NextRequest) {
    //  Step 1: Validate token & get userId
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Step 2: Validate admin user
    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const { title, description, amount, receiptImage } = await req.json();

        if (!title || !amount || !receiptImage) {
            return NextResponse.json(
                { success: false, message: "Title, amount, and image are required." },
                { status: 400 }
            );
        }

        const receipt = await prisma.solidarityReceipts.create({
            data: {
                title,
                description: description || "",
                amount: parseFloat(amount),
                receiptImage,
            },
        });

        return NextResponse.json({ success: true, data: receipt }, { status: 201 });
    } catch (error) {
        console.error("POST Solidarity Receipt Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to create solidarity receipt." },
            { status: 500 }
        );
    }
}

/* ---------------------------------------------------
   GET - List All Solidarity Receipts (Admin Only)
--------------------------------------------------- */
export async function GET(req: NextRequest) {
    //  Step 1: Validate token
    const userId = await checkAuth(req);
    if (!userId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    //  Step 2: Validate admin
    const user = await prisma.users.findUnique({
        where: { id: userId },
        include: { role: true },
    });

    if (!user || user.role.name.toLowerCase() !== "admin") {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    try {
        const receipts = await prisma.solidarityReceipts.findMany({
            orderBy: { id: "desc" },
        });

        return NextResponse.json({ success: true, data: receipts });
    } catch (error) {
        console.error("GET Solidarity Receipts Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch receipts." },
            { status: 500 }
        );
    }
}
