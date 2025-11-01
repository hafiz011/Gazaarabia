import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma :any = new PrismaClient();

// ✅ Get all published FAQ categories
export async function GET() {
  try {
    const categories = await prisma.faqCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("FAQ Categories GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch FAQ categories." },
      { status: 500 }
    );
  }
}
