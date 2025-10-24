import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma:any = new PrismaClient();

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token:any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const productId = Number(params.id);

  await prisma.wishlist.delete({
    where: {
      userId_productId: { userId, productId },
    },
  });

  return NextResponse.json({ success: true });
}
