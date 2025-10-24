import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token: any = getTokenFromHeader(req)
  const userId = getUserIdFromToken(token);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const updated = await prisma.address.updateMany({
    where: { id: Number(params.id), userId },
    data: body,
  });

  if (!updated.count) {
    return NextResponse.json({ message: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Address updated" });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token: any = getTokenFromHeader(req)
  const userId = getUserIdFromToken(token);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const deleted = await prisma.address.deleteMany({
    where: { id: Number(params.id), userId },
  });

  if (!deleted.count) {
    return NextResponse.json({ message: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Address deleted" });
}
