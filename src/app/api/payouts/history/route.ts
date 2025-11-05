import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const token:any= getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);
  if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user || user.role.name.toLowerCase() !== "admin")
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const payouts = await prisma.payout.findMany({
    include: { affiliate: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: payouts }, { status: 200 });
}
