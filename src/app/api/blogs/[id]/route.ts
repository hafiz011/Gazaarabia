import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET blog by ID or slug
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    let blog;

    if (slug) {
      blog = await prisma.blogs.findUnique({
        where: { slug },
        include: { category: true },
      });
    } else {
      blog = await prisma.blogs.findUnique({
        where: { id: Number(id) },
        include: { category: true },
      });
    }

    if (!blog) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (err) {
    console.error("❌ Error fetching blog", err);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

// ✅ UPDATE blog
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.blogs.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Error updating blog", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

// ✅ DELETE blog
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.blogs.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting blog", err);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
