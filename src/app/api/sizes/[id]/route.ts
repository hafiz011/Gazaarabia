import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// GET Size by ID (Protected)
export async function GET(req: NextRequest, context: RouteContext) {
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
    const sizeId = Number(id);

    if (!sizeId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const size = await prisma.sizes.findUnique({ where: { id: sizeId } });

    if (!size) {
      return NextResponse.json({ error: "Size not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: size });
  } catch (error) {
    console.error(" GET Size Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch size" },
      { status: 500 }
    );
  }
}

//  PUT - Update Size (Protected)
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
    const sizeId = Number(id);

    if (!sizeId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const { name, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const updated = await prisma.sizes.update({
      where: { id: sizeId },
      data: { name: name.trim(), description },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error(" PUT Size Error:", error);
    return NextResponse.json(
      { error: "Failed to update size" },
      { status: 500 }
    );
  }
}

//  DELETE - Delete Size (Protected)
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
    const sizeId = Number(id);

    if (!sizeId) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await prisma.sizes.delete({
      where: { id: sizeId },
    });

    return NextResponse.json({
      success: true,
      message: "Size deleted successfully",
    });
  } catch (error) {
    console.error(" DELETE Size Error:", error);
    return NextResponse.json(
      { error: "Failed to delete size" },
      { status: 500 }
    );
  }
}
