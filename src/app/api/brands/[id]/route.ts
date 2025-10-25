import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// 🔐 GET - Get single brand by ID
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    const brand = await prisma.brand.findUnique({
      where: { id: Number(id) },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("❌ GET Brand Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}

// 🔐 PUT - Update brand
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const { name, logo, isTrending } = await req.json();

    const updated = await prisma.brand.update({
      where: { id: Number(id) },
      data: {
        name: name?.trim(),
        logo: logo || null,
        isTrending: Boolean(isTrending),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("❌ PUT Brand Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update brand" },
      { status: 500 }
    );
  }
}

// 🔐 DELETE - Delete brand
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    await prisma.brand.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true, message: "Brand deleted" });
  } catch (error) {
    console.error("❌ DELETE Brand Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete brand" },
      { status: 500 }
    );
  }
}
