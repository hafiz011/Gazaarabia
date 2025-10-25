import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 * @route DELETE /api/cart/clear
 * @desc Clear all items from the logged-in user's cart
 * @access Protected
 */
export async function DELETE(req: NextRequest) {
  try {
    // Verify user authentication
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Clear the user's cart
    await prisma.cart.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    console.error(" Error clearing cart:", error);
    return NextResponse.json(
      { success: false, message: "Failed to clear cart." },
      { status: 500 }
    );
  }
}
