import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();


// DELETE /api/users/[id]
export async function DELETE(req: Request, { params }: any) {
  const { id } = params;
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  const currentUser = await prisma.users.findUnique({
    where: { id: Number(userId) },
    include: { role: true },
  });

  if (!currentUser || currentUser.role.name.toLowerCase() !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    await prisma.users.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE User Error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
