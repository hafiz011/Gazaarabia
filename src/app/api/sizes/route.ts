import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma: any = new PrismaClient();

// GET all sizes (Protected)
export async function GET(req: Request) {
  const token:any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const sizes = await prisma.sizes.findMany({
      orderBy: { id: "desc" },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.error("GET Sizes Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sizes" },
      { status: 500 }
    );
  }
}

// CREATE new size (Protected)
export async function POST(req: Request) {
  const token:any = getTokenFromHeader(req);
  const userId = getUserIdFromToken(token);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const newSize = await prisma.sizes.create({
      data: {
        name,
        description: description || null,
      },
    });

    return NextResponse.json(newSize);
  } catch (error) {
    console.error("POST Size Error:", error);
    return NextResponse.json(
      { error: "Failed to create size" },
      { status: 500 }
    );
  }
}
