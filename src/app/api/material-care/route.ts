import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 * @route GET /api/material-care
 * @desc Get all material care records with search (Protected)
 */
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const rawSearch = searchParams.get("search") || "";
    const search = rawSearch.trim().toLowerCase();

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

    return NextResponse.json({
      success: true,
      message: materialCares.length
        ? "Material care records fetched successfully."
        : "No records found.",
      data: materialCares,
    });
  } catch (error) {
    console.error("❌ GET MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch material care records." },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/material-care
 * @desc Create a new material care record (Protected)
 */
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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

    return NextResponse.json({
      success: true,
      message: "Material care item created successfully.",
      data: newItem,
    });
  } catch (error) {
    console.error("❌ POST MaterialCare Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create material care item." },
      { status: 500 }
    );
  }
}
