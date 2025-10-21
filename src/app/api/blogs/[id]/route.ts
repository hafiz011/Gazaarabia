import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma:any = new PrismaClient();

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  try {
    const blog = await prisma.blogs.findUnique({
      where: { id: Number(params.id) },
      include: { category: true },
    });
    if (!blog) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(blog);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch blog" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    const updated = await prisma.blogs.update({
      where: { id: Number(params.id) },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    await prisma.blogs.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
