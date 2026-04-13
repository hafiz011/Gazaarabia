import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

//  GET - Single color (Protected)
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  // const allowedRoles = ["admin"];
  const allowedRoles = ["admin", "seller"]; // both admin and seller can access


  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    const { id } = await context.params;
    const colorId = Number(id);

    const color = await prisma.colors.findUnique({
      where: { id: colorId },
    });

    if (!color) {
      return NextResponse.json(
        { success: false, message: "Color not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: color });
  } catch (error) {
    console.error(" GET Color Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch color." },
      { status: 500 }
    );
  }
}

//  PUT - Update color (Protected)
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
    const colorId = Number(id);
    const { name, hexCode, rgbCode, description } = await req.json();

    if (!name || !hexCode) {
      return NextResponse.json(
        { success: false, message: "Name and hex code are required." },
        { status: 400 }
      );
    }

    const updated = await prisma.colors.update({
      where: { id: colorId },
      data: {
        name: name.trim(),
        hexCode: hexCode.trim(),
        rgbCode,
        description,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Color updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(" PUT Color Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update color." },
      { status: 500 }
    );
  }
}

// DELETE - Remove color (Protected)
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
    const colorId = Number(id);

    const existing = await prisma.colors.findUnique({ where: { id: colorId } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Color not found." },
        { status: 404 }
      );
    }

    await prisma.colors.delete({
      where: { id: colorId },
    });

    return NextResponse.json({
      success: true,
      message: "Color deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE Color Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete color." },
      { status: 500 }
    );
  }
}
