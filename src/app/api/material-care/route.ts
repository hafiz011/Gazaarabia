import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma :any = new PrismaClient();



/**
 * GET /api/material-care
 * Search in title, careType, material, description
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.trim().toLowerCase(); // lower for insensitive match

    const where = search
      ? {
          OR: [
            { title: { contains: search } },
            { careType: { contains: search } },
            { material: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : {};

    const materialCares = await prisma.materialCare.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      {
        success: true,
        message: materialCares.length
          ? "Material care records fetched successfully."
          : "No records found.",
        data: materialCares,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/material-care] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch material care records." },
      { status: 500 }
    );
  }
}


// ✅ POST (create)
export async function POST(req: Request) {
  try {
    const { title, description, careType, material, icon } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Title and description are required." },
        { status: 400 }
      );
    }

    const newItem = await prisma.materialCare.create({
      data: {
        title,
        description,
        careType: careType || null,
        material: material || null,
        icon: icon || null,
      },
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create material care." },
      { status: 500 }
    );
  }
}
