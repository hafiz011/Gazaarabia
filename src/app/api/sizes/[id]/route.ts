import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma :any= new PrismaClient();


// get
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const size = await prisma.sizes.findUnique({ where: { id } });
    if (!size) return NextResponse.json({ error: "Size not found" }, { status: 404 });
    return NextResponse.json(size);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch size" }, { status: 500 });
  }
}

// 📌 UPDATE Size
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { name, description } = await req.json();
    const updated = await prisma.sizes.update({
      where: { id },
      data: { name, description },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT Size Error:", error);
    return NextResponse.json({ error: "Failed to update size" }, { status: 500 });
  }
}


// 📌 DELETE Size
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.sizes.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: "Size deleted successfully" });
  } catch (error) {
    console.error("DELETE Size Error:", error);
    return NextResponse.json({ error: "Failed to delete size" }, { status: 500 });
  }
}
