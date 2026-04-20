import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// PUT - Update category (Protected)
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const { id } = await context.params;
  const categoryId = Number(id);

  try {
    const { name, slug, image, commission, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Category name is required." },
        { status: 400 }
      );
    }
    if (!slug || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: "Category slug is required." },
        { status: 400 }
      );
    }
    if (!image || !image.trim()) {
      return NextResponse.json(
        { success: false, message: "Category image is required." },
        { status: 400 }
      );
    }

    const existing = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    // Optional duplicate check
    const duplicate = await prisma.categories.findFirst({
      where: { slug: slug.trim(), NOT: { id: categoryId } },
    });

    if (duplicate) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists." },
        { status: 409 }
      );
    }

    const updated = await prisma.categories.update({
      where: { id: categoryId },
      data: {
        name: name.trim(),
        slug: slug.trim(),
        image,
        description: description || null
      },
    });

    if (commission !== undefined && commission !== null) {
      const parsedCommission = parseFloat(commission);

      const existingCommission = await prisma.categoryCommission.findUnique({
        where: { categoryId: categoryId }
      });

      if (existingCommission) {
        await prisma.categoryCommission.update({
          where: { categoryId: categoryId },
          data: { commission: parsedCommission }
        });
      } else {
        await prisma.categoryCommission.create({
          data: { categoryId: categoryId, commission: parsedCommission }
        });
      }
    }

    const finalCategory = await prisma.categories.findUnique({
      where: { id: categoryId },
      include: { categoryCommission: true }
    });

    return NextResponse.json({ success: true, data: finalCategory });
  } catch (error) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update category." },
      { status: 500 }
    );
  }
}

// DELETE - Delete category (Protected)
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const { id } = await context.params;
  const categoryId = Number(id);

  try {
    const existing = await prisma.categories.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }
    await prisma.categoryCommission.delete({
      where: { categoryId: categoryId },
    });

    await prisma.categories.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete category." },
      { status: 500 }
    );
  }
}
