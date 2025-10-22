import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

function getUserIdFromToken(req: Request) {
  const token = req.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("auth_token="))
    ?.split("=")[1];

  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
//   const userId = getUserIdFromToken(req);
  const userId = 2;
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  // const userId = getUserIdFromToken(req);
  const userId = 2;
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const address = await prisma.address.create({
    data: {
      ...body,
      userId,
    },
  });

  return NextResponse.json(address);
}
