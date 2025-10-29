import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";

const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   try {
//     // 🔐 Authentication check
//     const userId = await checkAuth(req);
//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search")?.trim() || "";

//     // 🕵️ Search conditions — removed mode for MySQL
//     const where = search
//       ? {
//           OR: [
//             { transactionId: { contains: search } },
//             { status: { contains: search } },
//             { paymentMethod: { contains: search } },
//             ...(isNaN(Number(search)) ? [] : [{ id: Number(search) }]),
//             {
//               user: {
//                 name: { contains: search },
//               },
//             },
//           ],
//         }
//       : {};

//     // 🧾 Fetch orders
//     const orders = await prisma.orders.findMany({
//       where,
//       include: {
//         user: {
//           select: { id: true, name: true, email: true },
//         },
//         orderItems: {
//           select: {
//             id: true,
//             quantity: true,
//             price: true,
//             product: { select: { title: true } },
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return NextResponse.json({ success: true, data: orders });
//   } catch (error) {
//     console.error("❌ Orders GET Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }



export async function GET(req: NextRequest) {
  try {
    // 🔐 Authentication check
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    // 🕵️ Search conditions
    const where = search
      ? {
          OR: [
            { transactionId: { contains: search } },
            { status: { contains: search } },
            { paymentMethod: { contains: search } },
            ...(isNaN(Number(search)) ? [] : [{ id: Number(search) }]),
            {
              user: {
                name: { contains: search },
              },
            },
          ],
        }
      : {};

    // 🧾 Fetch orders with variant details
    const orders = await prisma.orders.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        orderItems: {
          select: {
            id: true,
            quantity: true,
            price: true,
            product: { select: { title: true } },
            variant: {                                 // ✅ added this
              select: {
                sku: true,
                color: { select: { name: true } },
                size: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Orders GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}