import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: Request) {
  try {

    const token: any = getTokenFromHeader(req)
    const userId = getUserIdFromToken(token);

    // Get user from DB
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    console.error("Profile error:", err);
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
