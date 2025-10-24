import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

// ✅ GET by ID
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const category = await prisma.blogCategories.findUnique({
      where: { id: Number(id) },
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

// ✅ PUT (Update)
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { name, slug } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const finalSlug = slug?.trim() || slugify(name, { lower: true, strict: true });

    // Check for duplicates
    const duplicate = await prisma.blogCategories.findFirst({
      where: {
        OR: [{ name }, { slug: finalSlug }],
        NOT: { id: Number(id) },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Category with this name or slug already exists." },
        { status: 400 }
      );
    }

    const updated = await prisma.blogCategories.update({
      where: { id: Number(id) },
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

// ✅ DELETE
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    await prisma.blogCategories.delete({
      where: { id: Number(id) },
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
