import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 🍪 Get token from cookie
    // const token = req.headers
    //   .get("cookie")
    //   ?.split("; ")
    //   .find((c) => c.startsWith("auth_token="))
    //   ?.split("=")[1];

    // if (!token) {
    //   return NextResponse.json(
    //     { message: "Unauthorized: No token found" },
    //     { status: 401 }
    //   );
    // }

    // // 🔐 Verify token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    //   id: number;
    // };

    // 👤 Get user from DB
    const user = await prisma.users.findUnique({
      // where: { id: decoded.id },
      where: { id: 2 },
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
