import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();
type RouteContext = { params: Promise<{ id: string }> };

/**
 * @route GET /api/delivery-options/:id
 * @desc Get delivery option by ID (Protected)
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  const allowedRoles = ["admin"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    const { id } = await context.params;
    const optionId = Number(id);

    if (!optionId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const option = await prisma.deliveryOptions.findUnique({
      where: { id: optionId },
    });

    if (!option) {
      return NextResponse.json({ success: false, message: "Delivery option not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: option });
  } catch (error: any) {
    console.error(" GET delivery option error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch delivery option", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route PUT /api/delivery-options/:id
 * @desc Update delivery option (Protected)
 */
export async function PUT(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const optionId = Number(id);
    const body = await req.json();
    const { name, description, minTime, maxTime, cutOffTime, cost, freeOver, status } = body;

    if (!name || !minTime || !maxTime || !cutOffTime || cost === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await prisma.deliveryOptions.update({
      where: { id: optionId },
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
      message: "Delivery option updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error(" PUT delivery option error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update delivery option", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * @route DELETE /api/delivery-options/:id
 * @desc Delete delivery option (Protected)
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const optionId = Number(id);

    if (!optionId) {
      return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400 });
    }

    const existing = await prisma.deliveryOptions.findUnique({
      where: { id: optionId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, message: "Delivery option not found" }, { status: 404 });
    }

    await prisma.deliveryOptions.delete({ where: { id: optionId } });

    return NextResponse.json({
      success: true,
      message: "Delivery option deleted successfully",
    });
  } catch (error: any) {
    console.error(" DELETE delivery option error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete delivery option", error: error.message },
      { status: 500 }
    );
  }
}
