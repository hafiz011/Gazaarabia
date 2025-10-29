import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

//  GET all colors (Protected)
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const colors = await prisma.colors.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json({ success: true, data: colors });
  } catch (error) {
    console.error(" GET Colors Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch colors." },
      { status: 500 }
    );
  }
}

// POST - Create new color (Protected)
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, hexCode, rgbCode, description } = await req.json();

    if (!name || !hexCode) {
      return NextResponse.json(
        { success: false, message: "Name and hex code are required." },
        { status: 400 }
      );
    }

    const color = await prisma.colors.create({
      data: { name: name.trim(), hexCode: hexCode.trim(), rgbCode, description },
    });

    return NextResponse.json({
      success: true,
      message: "Color created successfully.",
      data: color,
    });
  } catch (error: any) {
    console.error("POST Color Error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "A color with this name already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create color." },
      { status: 500 }
    );
  }
}
