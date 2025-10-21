import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const color = await prisma.Colors.findUnique({ where: { id } });
  if (!color) return NextResponse.json({ error: "Color not found" }, { status: 404 });
  return NextResponse.json(color);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { name, slug, hexCode, rgbCode, description } = await req.json();

    const updated = await prisma.Colors.update({
      where: { id },
      data: { name, slug, hexCode, rgbCode, description },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Color Error:", error);
    return NextResponse.json({ error: "Failed to update color" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  await prisma.Colors.delete({ where: { id } });
  return NextResponse.json({ message: "Color deleted successfully" });
}
