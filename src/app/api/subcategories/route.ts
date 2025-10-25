import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any = new PrismaClient();

// GET all subcategories with optional search (Protected)
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const subcategories = await prisma.subcategory.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { name: { contains: search, mode: "insensitive" } } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message:
        subcategories.length === 0
          ? "No subcategories found."
          : "Subcategories fetched successfully.",
      data: subcategories,
    });
  } catch (error) {
    console.error("GET Subcategories Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategories." },
      { status: 500 }
    );
  }
}

// Create new subcategory (Protected)
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, categoryId } = await req.json();

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name, slug and Category are required." },
        { status: 400 }
      );
    }

    const exists = await prisma.subcategory.findUnique({
      where: { slug },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this name already exists." },
        { status: 409 }
      );
    }

    const newSubcategory = await prisma.subcategory.create({
      data: { name, slug, categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory created successfully.",
      data: newSubcategory,
    });
  } catch (error) {
    console.error("POST Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create subcategory." },
      { status: 500 }
    );
  }
}
