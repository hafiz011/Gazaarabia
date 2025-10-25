import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

/**
 * @route GET /api/material-care/:id
 * @desc Get material care item by ID (Protected)
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const materialCareId = Number(id);

    if (!materialCareId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const item = await prisma.materialCare.findUnique({
      where: { id: materialCareId },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Material care item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("❌ GET MaterialCare by ID Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch material care item." },
      { status: 500 }
    );
  }
}

/**
 * @route PUT /api/material-care/:id
 * @desc Update material care item (Protected)
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const materialCareId = Number(id);

    if (!materialCareId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const { title, description, careType, material, icon } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required." },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.materialCare.update({
      where: { id: materialCareId },
      data: {
        title,
        description,
        careType: careType || null,
        material: material || null,
        icon: icon || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Material care item updated successfully.",
      data: updatedItem,
    });
  } catch (error) {
    console.error("❌ PUT MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update material care item." },
      { status: 500 }
    );
  }
}

/**
 * @route DELETE /api/material-care/:id
 * @desc Delete material care item (Protected)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const materialCareId = Number(id);

    if (!materialCareId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const existing = await prisma.materialCare.findUnique({
      where: { id: materialCareId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Material care item not found." },
        { status: 404 }
      );
    }

    await prisma.materialCare.delete({
      where: { id: materialCareId },
    });

    return NextResponse.json({
      success: true,
      message: "Material care item deleted successfully.",
    });
  } catch (error) {
    console.error("❌ DELETE MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete material care item." },
      { status: 500 }
    );
  }
}
