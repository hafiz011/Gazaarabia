import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma :any = new PrismaClient();

// ✅ Get FAQs (optionally filtered by categoryId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");

    const faqs = await prisma.faq.findMany({
      where: categoryId ? { categoryId: Number(categoryId) } : {},
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("FAQs GET error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch FAQs." },
      { status: 500 }
    );
  }
}
