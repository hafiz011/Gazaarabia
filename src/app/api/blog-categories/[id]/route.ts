import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import slugify from "slugify";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

//  GET (Protected)
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const category = await prisma.blogCategories.findUnique({
      where: { id: Number(id) },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("GET Category Error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}

// PUT (Protected)
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { name, slug } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }

    const finalSlug = slug?.trim() || slugify(name, { lower: true, strict: true });

    // Check duplicate
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

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name or slug must be unique." },
        { status: 400 }
      );
    }

    console.error("PUT Category Error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}

//  DELETE (Protected)
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await prisma.blogCategories.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Deleted successfully." });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json({ error: "Failed to delete category." }, { status: 500 });
  }
}
