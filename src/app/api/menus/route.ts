import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/**  GET - All Menus */
export async function GET() {
  try {
    const menus = await prisma.menus.findMany({
      include: {
        submenus: true,
      },
      orderBy: [
        { position: "asc" },
        { id: "asc" },
      ],
    });
    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

/** 🟡 POST - Create Menu */
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { name, slug, type, images } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 🚫 Check for max 6 menu limit
    const totalMenus = await prisma.menus.count();
    if (totalMenus >= 6) {
      return NextResponse.json(
        {
          success: false,
          message: "You can only add up to 6 menus. Please delete one to add a new one.",
        },
        { status: 400 }
      );
    }

    const created = await prisma.menus.create({
      data: {
        name,
        slug,
        type,
        images: images || [],
        position: totalMenus + 1, // position defaults to next available
      },
    });

    return NextResponse.json({ success: true, data: created });
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create menu" },
      { status: 500 }
    );
  }
}
