import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

//  GET - Protected (List all blogs with optional filters)
export async function GET(request: NextRequest) {
  const userId = await checkAuth(request);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }


  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin", "content_manager"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");

    const where: any = {};

    if (categoryId && categoryId !== "all") {
      where.categoryId = Number(categoryId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const blogs = await prisma.blogs.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

//  POST - Protected (Create new blog)
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin", "content_manager"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, slug, content, image, categoryId } = body;

    if (!title || !content || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const blog = await prisma.blogs.create({
      data: {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, "-"),
        content,
        image: image || null,
        categoryId: Number(categoryId),
      },
    });

    return NextResponse.json({ success: true, data: blog });
  } catch (err) {
    console.error("Error creating blog:", err);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
