import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// 📝 UPDATE Address
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const addressId = Number(id);

    const token :any= getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.address.updateMany({
      where: { id: addressId, userId },
      data: body,
    });

    if (!updated.count) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Address updated successfully" });
  } catch (error) {
    console.error("❌ PUT /address/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to update address" },
      { status: 500 }
    );
  }
}

// ❌ DELETE Address
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const addressId = Number(id);

    const token :any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const deleted = await prisma.address.deleteMany({
      where: { id: addressId, userId },
    });

    if (!deleted.count) {
      return NextResponse.json({ message: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE /address/[id] error:", error);
    return NextResponse.json(
      { message: "Failed to delete address" },
      { status: 500 }
    );
  }
}
