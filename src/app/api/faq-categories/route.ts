import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.faqCategory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch FAQ categories." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { name, slug } = await req.json();

    if (!name || !slug)
      return NextResponse.json(
        { success: false, message: "Name and slug are required." },
        { status: 400 }
      );

    // 🧩 Check for duplicates
    const existing = await prisma.faqCategory.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    });

    if (existing) {
      const conflictField = existing.name === name ? "name" : "slug";
      return NextResponse.json(
        {
          success: false,
          message: `A FAQ category with this ${conflictField} already exists.`,
        },
        { status: 400 }
      );
    }

    const category = await prisma.faqCategory.create({
      data: { name, slug },
    });

    return NextResponse.json({
      success: true,
      message: "FAQ category created successfully.",
      data: category,
    });
  } catch (error) {
    console.error("FAQ Category POST error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create FAQ category." },
      { status: 500 }
    );
  }
}
