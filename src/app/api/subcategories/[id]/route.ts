import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// GET subcategory by ID (Protected)
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin", "seller"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    const { id } = await context.params;
    const subcategoryId = Number(id);

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      include: {
        category: true,
        subcategoryCommission: true
      },
    });

    if (!subcategory) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: subcategory });
  } catch (error) {
    console.error("GET Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategory." },
      { status: 500 }
    );
  }
}

// PUT - Update subcategory (Protected)
export async function PUT(req: NextRequest, context: RouteContext) {
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


  try {
    const { id } = await context.params;
    const subcategoryId = Number(id);

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const { name, slug, categoryId, commission, description } = await req.json();
    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name, slug and Category are required." },
        { status: 400 }
      );
    }

    const existing = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    const duplicate = await prisma.subcategory.findUnique({ where: { slug } });
    if (duplicate && duplicate.id !== subcategoryId) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this slug already exists." },
        { status: 409 }
      );
    }

    const updated = await prisma.subcategory.update({
      where: { id: subcategoryId },
      data: {
        name,
        slug,
        categoryId: Number(categoryId),
        description: description || null,
        ...(commission !== undefined && commission !== null
          ? {
            subcategoryCommission: {
              upsert: {
                create: { commission: parseFloat(commission) },
                update: { commission: parseFloat(commission) },
              }
            },
          }
          : {}),
      },
      include: {
        subcategoryCommission: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("PUT Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update subcategory." },
      { status: 500 }
    );
  }
}

// DELETE subcategory (Protected)
export async function DELETE(req: NextRequest, context: RouteContext) {
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


  try {
    const { id } = await context.params;
    const subcategoryId = Number(id);

    if (!subcategoryId) {
      return NextResponse.json(
        { success: false, message: "Invalid ID." },
        { status: 400 }
      );
    }

    const existing = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Subcategory not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Unlink products from this subcategory
      await tx.products.updateMany({
        where: { subcategoryId: subcategoryId },
        data: { subcategoryId: null },
      });

      // 2. Delete commissions
      await tx.subcategoryCommission.deleteMany({
        where: { subcategoryId: subcategoryId },
      });

      // 3. Delete subcategory
      await tx.subcategory.delete({
        where: { id: subcategoryId },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Subcategory deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete subcategory." },
      { status: 500 }
    );
  }
}
