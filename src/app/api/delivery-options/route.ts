import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma :any = new PrismaClient();

/**
 * @route GET /api/delivery-options
 * @desc Get all delivery options
 */
export async function GET() {
  try {
    const options = await prisma.deliveryOptions.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(options);
  } catch (error: any) {
    console.error("❌ GET all delivery options error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route POST /api/delivery-options
 * @desc Create new delivery option
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, minTime, maxTime, cutOffTime, cost, freeOver, status } = body;

    if (!name || !minTime || !maxTime || !cutOffTime || cost === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
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

    return NextResponse.json(
      { message: "Delivery option created successfully", data: newOption },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ POST delivery option error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
