import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/**
 * PUT /api/subcategories/reorder
 * 
 * Reorder subcategories within the same category using a transaction.
 * 
 * Body:
 * {
 *   "categoryId": number,
 *   "items": [
 *     { "id": number, "position": number }
 *   ]
 * }
 */
export async function PUT(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

  // Verify admin role
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.role.name.toLowerCase() !== "admin") {
    return NextResponse.json(
      { success: false, message: "Only admins can reorder subcategories" },
      { status: 403 }
    );
  }

  try {
    const { categoryId, items } = await req.json();

    // Validation
    if (!categoryId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "categoryId and items array are required" },
        { status: 400 }
      );
    }

    // Verify category exists
    const category = await prisma.categories.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found" },
        { status: 404 }
      );
    }

    // Verify all subcategories belong to this category
    const subcategoryIds = items.map((item) => item.id);
    const existingSubcategories = await prisma.subcategory.findMany({
      where: {
        id: { in: subcategoryIds },
        categoryId: Number(categoryId),
      },
    });

    if (existingSubcategories.length !== items.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Some subcategories do not belong to the specified category",
        },
        { status: 400 }
      );
    }

    // Use transaction with two-phase update to avoid unique constraint conflicts
    // Phase 1: Assign temporary positions (10000 + index) to avoid collisions
    // Phase 2: Assign final positions
    const updated = await prisma.$transaction(async (tx: any) => {
      // Phase 1: Set temporary positions
      const tempUpdates = items.map((item, index) =>
        tx.subcategory.update({
          where: { id: Number(item.id) },
          data: { position: 10000 + index },
        })
      );
      await Promise.all(tempUpdates);

      // Phase 2: Set final positions
      const finalUpdates = items.map((item) =>
        tx.subcategory.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      );
      return Promise.all(finalUpdates);
    });

    // Re-fetch all subcategories for the category to return normalized data
    const allSubcategories = await prisma.subcategory.findMany({
      where: { categoryId: Number(categoryId) },
      orderBy: { position: "asc" },
      include: { 
        category: { select: { id: true, name: true } },
        subcategoryCommission: true
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subcategories reordered successfully",
      data: allSubcategories,
    });
  } catch (err: any) {
    console.error("Error reordering subcategories:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to reorder subcategories",
      },
      { status: 500 }
    );
  }
}
