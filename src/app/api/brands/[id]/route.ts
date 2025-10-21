import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const brand = await prisma.brand.findUnique({ where: { id: Number(params.id) } });
    if (!brand) return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to fetch brand" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { name, logo, isTrending } = await req.json();
    const updated = await prisma.brand.update({
      where: { id: Number(params.id) },
      data: { name, logo, isTrending: Boolean(isTrending) },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.brand.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete brand" }, { status: 500 });
  }
}
