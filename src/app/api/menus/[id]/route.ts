import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

//  GET single menu
export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const menu = await prisma.menus.findUnique({
      where: { id: Number(id) },
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

//  PUT update menu
export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

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
    const { name, slug, type, images } = await req.json();

    if (!name || !slug || !type)
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });

    const updated = await prisma.menus.update({
      where: { id: Number(id) },
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

//  DELETE menu
export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const userId = await checkAuth(req);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    const { id } = await context.params
    await prisma.menus.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "Menu deleted successfully" });
  } catch (error) {
    console.error("DELETE /menus/[id] error:", error);
    return NextResponse.json({ success: false, message: "Failed to delete menu" }, { status: 500 });
  }
}
