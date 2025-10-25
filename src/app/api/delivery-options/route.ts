import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

/**
 * @route GET /api/delivery-options
 * @desc Get all delivery options (Protected)
 */
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const options = await prisma.deliveryOptions.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: options });
  } catch (error: any) {
    console.error("❌ GET all delivery options error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch delivery options", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/delivery-options
 * @desc Create new delivery option (Protected)
 */
export async function POST(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, minTime, maxTime, cutOffTime, cost, freeOver, status } = body;

    if (!name || !minTime || !maxTime || !cutOffTime || cost === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newOption = await prisma.deliveryOptions.create({
      data: {
        name,
        description,
        minTime: Number(minTime),
        maxTime: Number(maxTime),
        cutOffTime,
        cost: Number(cost),
        freeOver: freeOver ? Number(freeOver) : 0,
        status: status || "Active",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Delivery option created successfully",
      data: newOption,
    });
  } catch (error: any) {
    console.error("❌ POST delivery option error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create delivery option", error: error.message },
      { status: 500 }
    );
  }
}
