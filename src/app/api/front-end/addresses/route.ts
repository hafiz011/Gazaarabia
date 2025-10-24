import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma:any = new PrismaClient();

export async function GET(req: Request) {
  const token:any = getTokenFromHeader(req)
  const userId = getUserIdFromToken(token);

  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const token:any = getTokenFromHeader(req)
  const userId = getUserIdFromToken(token);

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
