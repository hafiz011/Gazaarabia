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
            category: true,
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
      categoryId,
      leftSubcategories,
      rightSubcategories,
      leftCustomLinks,
      rightCustomLinks,
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
      leftCustomLinks: leftCustomLinks || [],
      rightCustomLinks: rightCustomLinks || [],
    };

    //  For Product Menus
    if (type === "product") {
      data.categoryId = categoryId ? Number(categoryId) : null;
      data.leftSubcategories = Array.isArray(leftSubcategories)
        ? leftSubcategories
        : [];
      data.rightSubcategories = Array.isArray(rightSubcategories)
        ? rightSubcategories
        : [];
    }

    //  For Blog Menus
    else if (type === "blog") {
      data.categoryId = null;
      data.leftSubcategories = Array.isArray(leftSubcategories)
        ? leftSubcategories
        : [];
      data.rightSubcategories = Array.isArray(rightSubcategories)
        ? rightSubcategories
        : [];
    }

    //  For Gallery or Other types
    else {
      data.categoryId = null;
      data.leftSubcategories = [];
      data.rightSubcategories = [];
    }

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

/**  DELETE - Hard delete submenu */
export async function DELETE(
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
    const { id } = await context.params;
    await prisma.submenus.delete({ where: { id: Number(id) } });
    return NextResponse.json({
      success: true,
      message: "Submenu deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting submenu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete submenu" },
      { status: 500 }
    );
  }
}
