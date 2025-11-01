// // import { NextRequest, NextResponse } from "next/server";
// // import { PrismaClient } from "@prisma/client";
// // import { checkAuth } from "@/lib/authToken";

// // const prisma: any = new PrismaClient();

// // /** 🟢 GET - Single submenu */
// // export async function GET(
// //   req: NextRequest,
// //   { params }: { params: { id: string } }
// // ) {
// //   try {
// //     const id = Number(params.id);
// //     const submenu = await prisma.submenus.findUnique({
// //       where: { id },
// //       include: {
// //         menu: true,
// //         category: true,
// //       },
// //     });

// //     if (!submenu) {
// //       return NextResponse.json(
// //         { success: false, message: "Submenu not found" },
// //         { status: 404 }
// //       );
// //     }

// //     return NextResponse.json({ success: true, data: submenu });
// //   } catch (error) {
// //     console.error("Error fetching submenu:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Failed to fetch submenu" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // /** 🟡 PUT - Update submenu */
// // export async function PUT(
// //   req: NextRequest,
// //   { params }: { params: { id: string } }
// // ) {
// //   const userId = await checkAuth(req);
// //   if (!userId)
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

// //   try {
// //     const id = Number(params.id);
// //     const body = await req.json();
// //     const {
// //       name,
// //       slug,
// //       menuId,
// //       categoryId,
// //       leftSubcategories,
// //       rightSubcategories,
// //       leftCustomLinks,
// //       rightCustomLinks,
// //     } = body;

// //     if (!name || !slug || !menuId)
// //       return NextResponse.json(
// //         { message: "Missing required fields" },
// //         { status: 400 }
// //       );

// //     const parentMenu = await prisma.menus.findUnique({
// //       where: { id: Number(menuId) },
// //     });

// //     const data: any = {
// //       name,
// //       slug,
// //       menuId: Number(menuId),
// //     };

// //     if (parentMenu?.type === "product") {
// //       data.categoryId = categoryId ? Number(categoryId) : null;
// //       data.leftSubcategories = leftSubcategories || [];
// //       data.rightSubcategories = rightSubcategories || [];
// //       data.leftCustomLinks = leftCustomLinks || [];
// //       data.rightCustomLinks = rightCustomLinks || [];
// //     } else {
// //       data.categoryId = null;
// //       data.leftSubcategories = [];
// //       data.rightSubcategories = [];
// //       data.leftCustomLinks = [];
// //       data.rightCustomLinks = [];
// //     }

// //     const updated = await prisma.submenus.update({
// //       where: { id },
// //       data,
// //     });

// //     return NextResponse.json({ success: true, data: updated });
// //   } catch (error) {
// //     console.error("Error updating submenu:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Failed to update submenu" },
// //       { status: 500 }
// //     );
// //   }
// // }

// // /** 🔴 DELETE - Hard delete submenu */
// // export async function DELETE(
// //   req: NextRequest,
// //   { params }: { params: { id: string } }
// // ) {
// //   const userId = await checkAuth(req);
// //   if (!userId)
// //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

// //   try {
// //     const id = Number(params.id);
// //     await prisma.submenus.delete({
// //       where: { id },
// //     });

// //     return NextResponse.json({
// //       success: true,
// //       message: "Submenu deleted successfully",
// //     });
// //   } catch (error) {
// //     console.error("Error deleting submenu:", error);
// //     return NextResponse.json(
// //       { success: false, message: "Failed to delete submenu" },
// //       { status: 500 }
// //     );
// //   }
// // }


// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma :any = new PrismaClient();

// // ✅ Get all submenus (with product + blog category data)
// export async function GET() {
//   try {
//     const submenus = await prisma.submenus.findMany({
//       include: {
//         menu: {
//           include: {
//             category: true,
//             blogCategory: true,
//           },
//         },
//         category: true,
//         subcategory: true,
//       },
//       orderBy: { id: "asc" },
//     });

//     // 🧠 Fetch blog categories separately for mapping
//     const allBlogCategories = await prisma.blogCategories.findMany({
//       select: { id: true, name: true, slug: true },
//     });

//     // 🧠 Fetch product subcategories for product menus
//     const allProductSubcategories = await prisma.subcategory.findMany({
//       select: { id: true, name: true, slug: true, categoryId: true },
//     });

//     const formatted = submenus.map((submenu:any) => {
//       const { menu } = submenu;

//       const getCategoryData = (ids: any, type: string) => {
//         if (!Array.isArray(ids)) return [];
//         if (type === "blog") {
//           return ids
//             .map((id) => allBlogCategories.find((c:any) => c.id === Number(id)))
//             .filter(Boolean);
//         } else {
//           return ids
//             .map((id) => allProductSubcategories.find((c:any) => c.id === Number(id)))
//             .filter(Boolean);
//         }
//       };

//       const type = menu?.type ?? "product";

//       return {
//         id: submenu.id,
//         name: submenu.name,
//         slug: submenu.slug,
//         type,
//         menuName: menu?.name,
//         left: getCategoryData(submenu.leftSubcategories, type),
//         right: getCategoryData(submenu.rightSubcategories, type),
//         customLinks: {
//           left: submenu.leftCustomLinks || [],
//           right: submenu.rightCustomLinks || [],
//         },
//       };
//     });

//     return NextResponse.json({ success: true, data: formatted });
//   } catch (err) {
//     console.error("❌ GET Submenus Error:", err);
//     return NextResponse.json(
//       { success: false, message: "Failed to load submenus" },
//       { status: 500 }
//     );
//   }
// }

// // ✅ Create submenu
// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       name,
//       slug,
//       menuId,
//       categoryId,
//       leftSubcategories,
//       rightSubcategories,
//       leftCustomLinks,
//       rightCustomLinks,
//     } = body;

//     const menu = await prisma.menus.findUnique({ where: { id: menuId } });
//     if (!menu) {
//       return NextResponse.json(
//         { success: false, message: "Parent menu not found" },
//         { status: 404 }
//       );
//     }

//     const newSubmenu = await prisma.submenus.create({
//       data: {
//         name,
//         slug,
//         menuId,
//         categoryId: categoryId || null,
//         leftSubcategories,
//         rightSubcategories,
//         leftCustomLinks,
//         rightCustomLinks,
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Submenu created successfully",
//       data: newSubmenu,
//     });
//   } catch (err: any) {
//     console.error("❌ POST Submenu Error:", err);
//     return NextResponse.json(
//       { success: false, message: err.message || "Failed to create submenu" },
//       { status: 500 }
//     );
//   }
// }


import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma: any = new PrismaClient();

/**  GET - Single submenu by ID */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // const id = Number(params.id);
    const { id } = await context.params;
    const submenu = await prisma.submenus.findUnique({
      where: { id: Number(id) },
      include: {
        menu: {
          include: {
            category: true,
            blogCategory: true,
          },
        },
      },
    });

    if (!submenu) {
      return NextResponse.json(
        { success: false, message: "Submenu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: submenu });
  } catch (error) {
    console.error("Error fetching submenu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch submenu" },
      { status: 500 }
    );
  }
}

/**  PUT - Update submenu */
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    // const id = Number(params.id);
    const { id } = await context.params;
    const body = await req.json();
    const {
      name,
      slug,
      menuId,
      categoryId,
      leftSubcategories,
      rightSubcategories,
      leftCustomLinks,
      rightCustomLinks,
    } = body;

    if (!name || !slug || !menuId)
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );

    //  Find parent menu type
    const parentMenu = await prisma.menus.findUnique({
      where: { id: Number(menuId) },
    });

    const type = parentMenu?.type || "product";

    const data: any = {
      name,
      slug,
      menuId: Number(menuId),
      leftCustomLinks: leftCustomLinks || [],
      rightCustomLinks: rightCustomLinks || [],
    };

    //  For Product Menus
    if (type === "product") {
      data.categoryId = categoryId ? Number(categoryId) : null;
      data.leftSubcategories = Array.isArray(leftSubcategories)
        ? leftSubcategories
        : [];
      data.rightSubcategories = Array.isArray(rightSubcategories)
        ? rightSubcategories
        : [];
    }

    //  For Blog Menus
    else if (type === "blog") {
      data.categoryId = null;
      data.leftSubcategories = Array.isArray(leftSubcategories)
        ? leftSubcategories
        : [];
      data.rightSubcategories = Array.isArray(rightSubcategories)
        ? rightSubcategories
        : [];
    }

    //  For Gallery or Other types
    else {
      data.categoryId = null;
      data.leftSubcategories = [];
      data.rightSubcategories = [];
    }

    const updated = await prisma.submenus.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Submenu updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("Error updating submenu:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update submenu" },
      { status: 500 }
    );
  }
}

/**  DELETE - Hard delete submenu */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const userId = await checkAuth(req);
  if (!userId)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    await prisma.submenus.delete({ where: { id: Number(id) } });
    return NextResponse.json({
      success: true,
      message: "Submenu deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting submenu:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete submenu" },
      { status: 500 }
    );
  }
}
