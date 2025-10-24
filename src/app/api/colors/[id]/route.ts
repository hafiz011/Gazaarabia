import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ GET Color by ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const colorId = Number(id);

    const color = await prisma.colors.findUnique({ where: { id: colorId } });

    if (!color) {
      return NextResponse.json({ error: "Color not found" }, { status: 404 });
    }

    return NextResponse.json(color);
  } catch (error) {
    console.error("GET Color Error:", error);
    return NextResponse.json({ error: "Failed to fetch color" }, { status: 500 });
  }
}

// ✅ UPDATE Color
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const colorId = Number(id);

    const { name, hexCode, rgbCode, description } = await req.json();

    const updated = await prisma.colors.update({
      where: { id: colorId },
      data: { name, hexCode, rgbCode, description },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Color Error:", error);
    return NextResponse.json({ error: "Failed to update color" }, { status: 500 });
  }
}

// ❌ DELETE Color
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const colorId = Number(id);

    await prisma.colors.delete({ where: { id: colorId } });

    return NextResponse.json({ message: "Color deleted successfully" });
  } catch (error) {
    console.error("DELETE Color Error:", error);
    return NextResponse.json({ error: "Failed to delete color" }, { status: 500 });
  }
}
