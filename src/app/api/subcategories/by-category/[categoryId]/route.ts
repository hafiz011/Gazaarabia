import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkAuth } from "@/lib/authToken";

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ categoryId: string }> }

) {
    try {
        const userId = await checkAuth(req);
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user || user.role.name.toLowerCase() !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        const { categoryId } = await context.params;
        const parsedId = Number(categoryId);


        if (!parsedId) {
            return NextResponse.json(
                { success: false, message: "Invalid category id." },
                { status: 400 }
            );
        }

        const subcategories = await prisma.subcategory.findMany({
            where: { categoryId: parsedId },
            orderBy: { name: "asc" },
        });

        return NextResponse.json({
            success: true,
            message: "Subcategories fetched successfully.",
            data: subcategories,
        });
    } catch (error) {
        console.error("GET By Category Subcategories Error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to fetch subcategories." },
            { status: 500 }
        );
    }
}
