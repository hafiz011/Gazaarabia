import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

//  Get single FAQ by ID
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const faq = await prisma.faq.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });

    if (!faq)
      return NextResponse.json({ success: false, message: "FAQ not found." }, { status: 404 });

    return NextResponse.json({ success: true, data: faq });
  } catch (error) {
    console.error("FAQ GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch FAQ." }, { status: 500 });
  }
}

//  Update FAQ
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const { id } = await context.params;
  try {
    const { question, answer, categoryId } = await req.json();

    // const id = Number(id);

    const duplicate = await prisma.faq.findFirst({
      where: {
        question,
        categoryId,
        // NOT: { id },
        NOT: { id: Number(id) },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "A FAQ with this question already exists in this category." },
        { status: 400 }
      );
    }

    const updated = await prisma.faq.update({
      // where: { id },
      where: { id: Number(id) },
      data: { question, answer, categoryId },
    });

    return NextResponse.json({ success: true, message: "FAQ updated successfully.", data: updated });
  } catch (error) {
    console.error("FAQ PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update FAQ." }, { status: 500 });
  }
}

//  Delete FAQ
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const { id } = await context.params;

  try {
    await prisma.faq.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "FAQ deleted successfully." });
  } catch (error) {
    console.error("FAQ DELETE error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete FAQ." }, { status: 500 });
  }
}
