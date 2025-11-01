import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any = new PrismaClient();

// ✅ Get all FAQs
export async function GET(req: NextRequest) {
  try {
    const faqs = await prisma.faq.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: faqs });
  } catch (error) {
    console.error("FAQ GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch FAQs." }, { status: 500 });
  }
}

// ✅ Create new FAQ
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { question, answer, categoryId } = await req.json();

    if (!question || !answer || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Question, answer, and category are required." },
        { status: 400 }
      );
    }

    // Check duplicate question in same category
    const existing = await prisma.faq.findFirst({
      where: { question, categoryId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "A FAQ with this question already exists in this category." },
        { status: 400 }
      );
    }

    const faq = await prisma.faq.create({
      data: { question, answer, categoryId },
    });

    return NextResponse.json({ success: true, message: "FAQ created successfully.", data: faq });
  } catch (error) {
    console.error("FAQ POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to create FAQ." }, { status: 500 });
  }
}
