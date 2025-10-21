import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

// ✅ GET by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const item = await prisma.materialCare.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, message: "Material care item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item });
  } catch (error) {
    console.error("GET MaterialCare by ID Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch item." },
      { status: 500 }
    );
  }
}

// ✅ PUT (Update)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const { title, description, careType, material, icon } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required." },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.materialCare.update({
      where: { id },
      data: {
        title,
        description,
        careType: careType || null,
        material: material || null,
        icon: icon || null,
      },
    });

    return NextResponse.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("PUT MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update material care item." },
      { status: 500 }
    );
  }
}

// ✅ DELETE
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    await prisma.materialCare.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Item deleted." });
  } catch (error) {
    console.error("DELETE MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete item." },
      { status: 500 }
    );
  }
}
