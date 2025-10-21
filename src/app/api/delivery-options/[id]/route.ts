import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

/**
 * @route GET /api/delivery-options/:id
 * @desc Get delivery option by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    const option = await prisma.deliveryOptions.findUnique({ where: { id } });
    if (!option) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(option);
  } catch (error: any) {
    console.error("❌ GET delivery option error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route PUT /api/delivery-options/:id
 * @desc Update delivery option by ID
 */
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name, description, minTime, maxTime, cutOffTime, cost, freeOver, status } = body;

    if (!name || !minTime || !maxTime || !cutOffTime || cost === undefined) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await prisma.deliveryOptions.update({
      where: { id },
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
      message: "Delivery option updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("❌ PUT delivery option error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route DELETE /api/delivery-options/:id
 * @desc Delete delivery option by ID
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    await prisma.deliveryOptions.delete({ where: { id } });

    return NextResponse.json({
      message: "Delivery option deleted successfully",
    });
  } catch (error: any) {
    console.error("❌ DELETE delivery option error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
