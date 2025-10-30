import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Fetch single blog by slug (Public)
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "Slug is required" },
        { status: 400 }
      );
    }

    const blog = await prisma.blogs.findUnique({
      where: { slug },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("❌ Error fetching blog by slug:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
