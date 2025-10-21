import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    // 🧭 FIX HERE
    const existing = await prisma.categories.findUnique({
      where: { name },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this name already exists." },
        { status: 409 }
      );
    }

    const category = await prisma.categories.create({
      data: { name },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
