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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  // const userId = getUserIdFromToken(req);
  const userId = 2;
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
  // const userId = getUserIdFromToken(req);
   const userId = 2;
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const deleted = await prisma.address.deleteMany({
    where: { id: Number(params.id), userId },
  });

  if (!deleted.count) {
    return NextResponse.json({ message: "Address not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Address deleted" });
}
