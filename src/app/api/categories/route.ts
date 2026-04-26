import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { Description } from "@mui/icons-material";

const prisma: any = new PrismaClient();

//POST - Create a new category
export async function POST(req: NextRequest) {
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
    const { name, slug, image, commission, description, submenuId } = await req.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Name is required." },
        { status: 400 }
      );
    }
    if (!slug || slug.trim() === "") {
      return NextResponse.json(
        { success: false, message: "Slug is required." },
        { status: 400 }
      );
    }

    // Check if category already exists
    const existing = await prisma.categories.findUnique({
      where: { slug: slug.trim() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category with this slug already exists." },
        { status: 409 }
      );
    }

    // If submenuId provided, validate it exists
    let position = 0;
    if (submenuId) {
      const submenu = await prisma.submenus.findUnique({
        where: { id: Number(submenuId) },
      });

      if (!submenu) {
        return NextResponse.json(
          { success: false, message: "Submenu not found." },
          { status: 404 }
        );
      }

      // Calculate next position for this submenu
      const maxPosition = await prisma.categories.aggregate({
        where: { submenuId: Number(submenuId) },
        _max: { position: true },
      });
      position = (maxPosition._max.position ?? -1) + 1;
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const newCategory = await tx.categories.create({
        data: {
          name: name.trim(),
          slug: slug.trim(),
          image,
          description: description || null,
          submenuId: submenuId ? Number(submenuId) : null,
          position: position,
        },
      });

      if (commission !== null && commission !== undefined && commission !== "") {
        const parsedCommission = parseFloat(commission.toString());
        if (!isNaN(parsedCommission)) {
          await tx.categoryCommission.create({
            data: {
              categoryId: newCategory.id,
              commission: parsedCommission,
            },
          });
        }
      }

      return newCategory;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error(" POST Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create category." },
      { status: 500 }
    );
  }
}

//  GET - List all categories
export async function GET(req: NextRequest) {
  const userId = await checkAuth(req);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  // const allowedRoles = ["admin"];
  const allowedRoles = ["admin", "seller"];

  if (!user || !allowedRoles.includes(user.role.name.toLowerCase())) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }


  try {
    // Check if submenuId is provided in query
    const url = new URL(req.url);
    const submenuId = url.searchParams.get("submenuId");

    const whereClause = submenuId ? { submenuId: Number(submenuId) } : {};
    const orderBy = submenuId 
      ? { position: "asc" as const }
      : { id: "desc" as const };

    const categories = await prisma.categories.findMany({
      where: whereClause,
      orderBy,
      include: { 
        categoryCommission: true,
        submenu: {
          select: { 
            id: true, 
            name: true, 
            menuId: true,
            menu: {
              select: { name: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error(" GET Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch categories." },
      { status: 500 }
    );
  }
}
