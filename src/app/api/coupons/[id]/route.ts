import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const coupon = await prisma.coupon.findUnique({
      where: { id: Number(params.id) },
    });

    if (!coupon) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ data: coupon }, { status: 200 });
  } catch (err: any) {
    console.error("Get coupon error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const data = await req.json();
    const updated = await prisma.coupon.update({
      where: { id: Number(params.id) },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json({ message: "Updated successfully", data: updated }, { status: 200 });
  } catch (err: any) {
    console.error("Update coupon error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    await prisma.coupon.delete({ where: { id: Number(params.id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (err: any) {
    console.error("Delete coupon error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
