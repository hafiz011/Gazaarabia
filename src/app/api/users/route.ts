import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 *  GET /api/users
 * Returns all users (Admin only)
 */
export async function GET(req: Request) {
  const token: any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

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


  //  Optional: Check if user is admin
  const currentUser = await prisma.users.findUnique({
    where: { id: Number(userId) },
    include: { role: true },
  });

  if (!currentUser || currentUser.role.name.toLowerCase() !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.users.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET Users Error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

