import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any = new PrismaClient();

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { name, slug } = await req.json();
    const updated = await prisma.faqCategory.update({
      where: { id: Number(params.id) },
      data: { name, slug },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update FAQ category." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    await prisma.faqCategory.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete FAQ category." }, { status: 500 });
  }
}
