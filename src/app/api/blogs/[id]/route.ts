import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// 🔐 GET blog by ID or slug (Protected)
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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

    return NextResponse.json({ success: true, data: blog });
  } catch (err) {
    console.error("❌ Error fetching blog:", err);
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

// 🔐 UPDATE blog
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await req.json();

    const updated = await prisma.blogs.update({
      where: { id: Number(id) },
      data: body,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("❌ Error updating blog:", err);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

// 🔐 DELETE blog
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await prisma.blogs.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Blog deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting blog:", err);
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
