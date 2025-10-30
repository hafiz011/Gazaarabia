import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma :any= new PrismaClient();

// 🟢 GET single menu
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const menu = await prisma.menus.findUnique({
      where: { id },
      include: { submenus: true },
    });
    if (!menu)
      return NextResponse.json({ success: false, message: "Menu not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error("GET /menus/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch menu" }, { status: 500 });
  }
}

// 🟡 PUT update menu
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const id = Number(params.id);
    const { name, slug, type, images } = await req.json();

    if (!name || !slug || !type)
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

    const updated = await prisma.menus.update({
      where: { id },
      data: {
        name,
        slug,
        type,
        images: images || [],
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT /menus/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to update menu" }, { status: 500 });
  }
}

// 🔴 DELETE menu
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const id = Number(params.id);
    await prisma.menus.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Menu deleted successfully" });
  } catch (error) {
    console.error("DELETE /menus/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete menu" }, { status: 500 });
  }
}
