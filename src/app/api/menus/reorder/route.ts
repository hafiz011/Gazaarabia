import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma :any = new PrismaClient();

export async function PUT(req: NextRequest) {
  try {
    const { orderedIds } = await req.json();

    if (!Array.isArray(orderedIds))
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    await Promise.all(
      orderedIds.map((id: number, index: number) =>
        prisma.menus.update({
          where: { id },
          data: { position: index + 1 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Menu reorder error:", err);
    return NextResponse.json({ error: "Failed to reorder menus" }, { status: 500 });
  }
}
