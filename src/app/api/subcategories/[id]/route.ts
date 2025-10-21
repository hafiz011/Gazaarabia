import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma :any= new PrismaClient();

// ✅ Get subcategory by ID
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const subcategory = await prisma.subcategory.findUnique({
      where: { id: Number(params.id) },
      include: { category: true },
    });

    if (!subcategory) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error) {
    console.error("GET Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategory." },
      { status: 500 }
    );
  }
}

// ✅ Update subcategory
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name and Category are required." },
        { status: 400 }
      );
    }

    const id = Number(params.id);
    const existing = await prisma.subcategory.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    // Check duplicate name
    const duplicate = await prisma.subcategory.findUnique({ where: { name } });
    if (duplicate && duplicate.id !== id) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this name already exists." },
        { status: 409 }
      );
    }

    const updated = await prisma.subcategory.update({
      where: { id },
      data: { name, categoryId },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subcategory." },
      { status: 500 }
    );
  }
}

// ✅ Delete subcategory
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const existing = await prisma.subcategory.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    await prisma.subcategory.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Subcategory deleted successfully." });
  } catch (error) {
    console.error("DELETE Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subcategory." },
      { status: 500 }
    );
  }
}
