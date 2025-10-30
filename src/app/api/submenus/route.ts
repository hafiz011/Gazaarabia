import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/** 🟢 GET - All submenus */
export async function GET() {
  try {
    const submenus = await prisma.submenus.findMany({
      include: {
        menu: { select: { id: true, name: true, slug: true, type: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: [{ position: "asc" }, { id: "asc" }],
    });

    return NextResponse.json({ success: true, data: submenus });
  } catch (error) {
    console.error("Error fetching submenus:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submenus" },
      { status: 500 }
    );
  }
}


// POST - Create new submenu
export async function POST(req: Request) {
  try {
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

    const menu = await prisma.menus.findUnique({ where: { id: Number(menuId) } });
    if (!menu)
      return NextResponse.json(
        { success: false, message: "Parent menu not found" },
        { status: 404 }
      );

    const data: any = {
      name,
      slug,
      menuId: Number(menuId),
      categoryId: categoryId || null,
      leftSubcategories: leftSubcategories || [],
      rightSubcategories: rightSubcategories || [],
      leftCustomLinks: leftCustomLinks || [],
      rightCustomLinks: rightCustomLinks || [],
    };

    const newSubmenu = await prisma.submenus.create({ data });

    return NextResponse.json({
      success: true,
      message: "Submenu created successfully",
      data: newSubmenu,
    });
  } catch (err: any) {
    console.error("❌ POST Submenu Error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to create submenu" },
      { status: 500 }
    );
  }
}