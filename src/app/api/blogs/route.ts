import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
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

    return NextResponse.json(blog);
  } catch (err) {
    console.error("Error creating blog:", err);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}
