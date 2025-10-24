import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// ✅ GET Subcategory by ID
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const subcategoryId = Number(id);

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      include: { category: true },
    });

    if (!subcategory) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: subcategory });
  } catch (error) {
    console.error("❌ GET Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategory." },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update Subcategory
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const subcategoryId = Number(id);

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name and Category are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    // ✅ Check duplicate name
    const duplicate = await prisma.subcategory.findUnique({
      where: { name },
    });

    if (duplicate && duplicate.id !== subcategoryId) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this name already exists." },
        { status: 409 }
      );
    }

    const updated = await prisma.subcategory.update({
      where: { id: subcategoryId },
      data: {
        name,
        categoryId: Number(categoryId),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ PUT Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subcategory." },
      { status: 500 }
    );
  }
}

// ✅ DELETE Subcategory
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const subcategoryId = Number(id);

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const existing = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    await prisma.subcategory.delete({
      where: { id: subcategoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted successfully.",
    });
  } catch (error) {
    console.error("❌ DELETE Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subcategory." },
      { status: 500 }
    );
  }
}
