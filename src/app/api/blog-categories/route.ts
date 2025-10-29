import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import slugify from "slugify";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

// GET - Protected
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.blogCategories.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error(" GET Categories Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}

// POST - Protected
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Category name is required." },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const finalSlug =
      slug && slug.trim() !== ""
        ? slug
        : slugify(name, { lower: true, strict: true });

    //  Check duplicate
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

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name or slug must be unique." },
        { status: 400 }
      );
    }

    console.error("POST Category Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
