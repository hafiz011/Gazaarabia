import { NextResponse } from "next/server";
import { PrismaClient, Prisma  } from "@prisma/client";

const prisma :any= new PrismaClient();


// 📌 GET all colors
export async function GET() {
  try {
    const colors = await prisma.Colors.findMany({
      orderBy: { id: "desc" },
    });
    return NextResponse.json(colors);
  } catch (error) {
    console.error("GET Colors Error:", error);
    return NextResponse.json({ error: "Failed to fetch colors" }, { status: 500 });
  }
}



export async function POST(req: Request) {
  try {
    const { name, hexCode, rgbCode, description } = await req.json();

    if (!name || !hexCode) {
      return NextResponse.json(
        { success: false, message: "Name and hex code are required" },
        { status: 400 }
      );
    }

    const color = await prisma.Colors.create({
      data: { name, hexCode, rgbCode, description },
    });

    return NextResponse.json({
      success: true,
      message: "Color created successfully",
      data: color,
    });
  } catch (error: any) {
    console.error("POST Color Error:", error);

    // ✅ Use `Prisma` namespace, not `prisma` instance
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          {
            success: false,
            message: "A color with this name already exists. Please choose a different name.",
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Failed to create color. Please try again." },
      { status: 500 }
    );
  }
}