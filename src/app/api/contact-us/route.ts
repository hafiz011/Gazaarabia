import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken"; // same method you use for admin validation

const prisma: any = new PrismaClient();

// GET: List all contact messages
export async function GET(req: NextRequest) {
  try {
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { role: true }
    });

    const allowedRoles = ["admin"];

    if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }


    const messages = await prisma.contactUs.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch contact messages" }, { status: 500 });
  }
}
