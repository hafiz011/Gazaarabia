import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any = new PrismaClient();

//POST - Create a new category
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name , slug} = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }
    if (!slug || slug.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Slug is required." },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await prisma.categories.findUnique({
      where: { slug: slug.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this slug already exists." },
        { status: 409 }
      );
    }

    const category = await prisma.categories.create({
      data: { name: name.trim(), slug: slug.trim() },
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    console.error(" POST Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category." },
      { status: 500 }
    );
  }
}

//  GET - List all categories
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.categories.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error(" GET Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
