import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import slugify from "slugify";

const prisma:any = new PrismaClient();

export async function GET() {
  try {
    const categories = await prisma.blogCategories.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, slug } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    // ✅ Auto-generate slug if not provided
    const finalSlug =
      slug && slug.trim() !== ""
        ? slug
        : slugify(name, { lower: true, strict: true });

    // ✅ Check duplicate name or slug
    const existing = await prisma.blogCategories.findFirst({
      where: {
        OR: [{ name }, { slug: finalSlug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category with this name or slug already exists." },
        { status: 400 }
      );
    }

    const category = await prisma.blogCategories.create({
      data: { name, slug: finalSlug },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name or slug must be unique." },
        { status: 400 }
      );
    }

    console.error("POST error:", error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
