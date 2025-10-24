import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

// ❌ DELETE product from wishlist
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const productId = Number(id);

    const token :any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return NextResponse.json({ success: true, message: "Product removed from wishlist" });
  } catch (error: any) {
    console.error("❌ DELETE wishlist error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to remove product from wishlist" },
      { status: 500 }
    );
  }
}
