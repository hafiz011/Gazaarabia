import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import slugify from "slugify";

const prisma:any = new PrismaClient();

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const category = await prisma.blogCategories.findUnique({
      where: { id: Number(params.id) },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, slug } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const finalSlug =
      slug && slug.trim() !== ""
        ? slug
        : slugify(name, { lower: true, strict: true });

    // ✅ Check if another category uses the same name/slug
    const duplicate = await prisma.blogCategories.findFirst({
      where: {
        OR: [{ name }, { slug: finalSlug }],
        NOT: { id: Number(params.id) },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Category with this name or slug already exists." },
        { status: 400 }
      );
    }

    const updated = await prisma.blogCategories.update({
      where: { id: Number(params.id) },
      data: { name, slug: finalSlug },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name or slug must be unique." },
        { status: 400 }
      );
    }

    console.error("PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.blogCategories.delete({
      where: { id: Number(params.id) },
    });
    return NextResponse.json({ message: "Deleted successfully." });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete category." },
      { status: 500 }
    );
  }
}
