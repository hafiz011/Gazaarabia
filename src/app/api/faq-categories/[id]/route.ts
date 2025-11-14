import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const { id } = await context.params; // Await params
  try {
    const { name, slug } = await req.json();
    const updated = await prisma.faqCategory.update({
      where: { id: Number(id) },
      data: { name, slug },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to update FAQ category." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await context.params; // Await params
  try {
    await prisma.faqCategory.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Category deleted." });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Failed to delete FAQ category." }, { status: 500 });
  }
}
