import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/**  GET - Single submenu by ID */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // const id = Number(params.id);
    const { id } = await context.params;
    const submenu = await prisma.submenus.findUnique({
      where: { id: Number(id) },
      include: {
        menu: {
          include: {
            blogCategory: true,
          },
        },
      },
    });

    if (!submenu) {
      return NextResponse.json(
        { success: false, message: "Submenu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: submenu });
  } catch (error) {
    console.error("Error fetching submenu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submenu" },
      { status: 500 }
    );
  }
}

/**  PUT - Update submenu */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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


  try {
    // const id = Number(params.id);
    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      slug,
      menuId,
      position,
    } = body;

    if (!name || !slug || !menuId)
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );

    //  Find parent menu type
    const parentMenu = await prisma.menus.findUnique({
      where: { id: Number(menuId) },
    });

    const type = parentMenu?.type || "product";

    const data: any = {
      name,
      slug,
      menuId: Number(menuId),
      position: Number(position) // Ensure position is a number
    };


    const updated = await prisma.submenus.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Submenu updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating submenu:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update submenu" },
      { status: 500 }
    );
  }
}

/**  DELETE - Hard delete submenu + recalculate positions */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await context.params;
    const submenuId = Number(id);

    // Find the submenu to get its menuId
    const submenu = await prisma.submenus.findUnique({
      where: { id: submenuId },
      select: { menuId: true },
    });

    if (!submenu) {
      return NextResponse.json(
        { success: false, message: "Submenu not found" },
        { status: 404 }
      );
    }

    // Use transaction to delete and recalculate positions
    const result = await prisma.$transaction(async (tx: any) => {
      // Delete the submenu
      await tx.submenus.delete({ where: { id: submenuId } });

      // Get remaining submenus for this menu, ordered by position
      const remaining = await tx.submenus.findMany({
        where: { menuId: submenu.menuId },
        orderBy: { position: "asc" },
      });

      // Recalculate positions (0, 1, 2, ...)
      for (let i = 0; i < remaining.length; i++) {
        await tx.submenus.update({
          where: { id: remaining[i].id },
          data: { position: i },
        });
      }

      return remaining;
    });

    return NextResponse.json({
      success: true,
      message: "Submenu deleted successfully. Positions recalculated.",
      data: result,
    });
  } catch (error: any) {
    console.error("Error deleting submenu:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete submenu",
      },
      { status: 500 }
    );
  }
}
