import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma:any = new PrismaClient();

// ✅ GET all subcategories with optional search
// export async function GET(req: Request) {
//   try {
//     // Get search param from URL
//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search") || "";

//     const subcategories = await prisma.subcategory.findMany({
//       where: search
//         ? {
//             OR: [
//               {
//                 name: {
//                   contains: search,
//                   mode: "insensitive", // case-insensitive search
//                 },
//               },
//               {
//                 category: {
//                   name: {
//                     contains: search,
//                     mode: "insensitive",
//                   },
//                 },
//               },
//             ],
//           }
//         : undefined,
//       orderBy: { createdAt: "desc" },
//       include: { category: true },
//     });

//     return NextResponse.json(
//       {
//         success: true,
//         message:
//           subcategories.length === 0
//             ? "No subcategories found"
//             : "Subcategories fetched successfully",
//         data: subcategories,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("GET Subcategories Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch subcategories." },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    const subcategories = await prisma.subcategory.findMany({
      where: search
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              {
                category: {
                  name: {
                    contains: search,
                  },
                },
              },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    return NextResponse.json(
      {
        success: true,
        message:
          subcategories.length === 0
            ? "No subcategories found"
            : "Subcategories fetched successfully",
        data: subcategories,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET Subcategories Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subcategories." },
      { status: 500 }
    );
  }
}

// ✅ Create new subcategory
export async function POST(req: Request) {
  try {
    const { name, categoryId } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { success: false, message: "Name and Category are required." },
        { status: 400 }
      );
    }

    // Check for duplicate
    const exists = await prisma.subcategory.findUnique({
      where: { name },
    });

    if (exists) {
      return NextResponse.json(
        { success: false, message: "A subcategory with this name already exists." },
        { status: 409 }
      );
    }

    const newSubcategory = await prisma.subcategory.create({
      data: { name, categoryId },
    });

    return NextResponse.json(
      { success: true, data: newSubcategory },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Subcategory Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create subcategory." },
      { status: 500 }
    );
  }
}
