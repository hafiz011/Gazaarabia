import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma:any = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 🕵️ Extract search query
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    // 🧠 Build search filter (no `mode`)
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
          ],
        }
      : {};

    // 🗃️ Fetch brands with optional search
    const brands = await prisma.brand.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: brands });
  } catch (error) {
    console.error("❌ GET Brand Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch brands" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, logo, isTrending } = await req.json();

    // ✅ Basic validation
    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Brand name is required." },
        { status: 400 }
      );
    }

    // ✅ Create new brand
    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        logo: logo || null,
        isTrending: Boolean(isTrending),
      },
    });

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error: any) {
    console.error("❌ POST Brand Error:", error);

    // ✅ Handle unique constraint
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "A brand with this name already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to create brand." },
      { status: 500 }
    );
  }
}
