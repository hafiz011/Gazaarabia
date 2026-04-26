import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/**
 * PUT /api/categories/reorder
 * 
 * Reorder categories within the same submenu using a transaction.
 * 
 * Body:
 * {
 *   "submenuId": number,
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
      { success: false, message: "Only admins can reorder categories" },
      { status: 403 }
    );
  }

  try {
    const { submenuId, items } = await req.json();

    // Validation
    if (!submenuId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "submenuId and items array are required" },
        { status: 400 }
      );
    }

    // Verify submenu exists
    const submenu = await prisma.submenus.findUnique({
      where: { id: Number(submenuId) },
    });

    if (!submenu) {
      return NextResponse.json(
        { success: false, message: "Submenu not found" },
        { status: 404 }
      );
    }

    // Verify all categories belong to this submenu
    const categoryIds = items.map((item) => item.id);
    const existingCategories = await prisma.categories.findMany({
      where: {
        id: { in: categoryIds },
        submenuId: Number(submenuId),
      },
    });

    if (existingCategories.length !== items.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Some categories do not belong to the specified submenu",
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
        tx.categories.update({
          where: { id: Number(item.id) },
          data: { position: 10000 + index },
        })
      );
      await Promise.all(tempUpdates);

      // Phase 2: Set final positions
      const finalUpdates = items.map((item) =>
        tx.categories.update({
          where: { id: Number(item.id) },
          data: { position: Number(item.position) },
        })
      );
      return Promise.all(finalUpdates);
    });

    // Re-fetch all categories for the submenu to return normalized data
    const allCategories = await prisma.categories.findMany({
      where: { submenuId: Number(submenuId) },
      orderBy: { position: "asc" },
      include: { 
        submenu: { select: { id: true, name: true } },
        categoryCommission: true
      },
    });

    return NextResponse.json({
      success: true,
      message: "Categories reordered successfully",
      data: allCategories,
    });
  } catch (err: any) {
    console.error("Error reordering categories:", err);
    return NextResponse.json(
      {
        success: false,
        message: err.message || "Failed to reorder categories",
      },
      { status: 500 }
    );
  }
}
