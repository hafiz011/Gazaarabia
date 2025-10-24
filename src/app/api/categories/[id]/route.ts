import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 📝 PUT - Update category
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const categoryId = Number(id);

  try {
    const { name } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    const updated = await prisma.categories.update({
      where: { id: categoryId },
      data: { name: name.trim() },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category." },
      { status: 500 }
    );
  }
}

// ❌ DELETE - Delete category
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const categoryId = Number(id);

  try {
    const existing = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    await prisma.categories.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category." },
      { status: 500 }
    );
  }
}
