import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken";
import { getReviewDetails } from "@/lib/helpers/getReviewByOrderItemId";


const prisma: any = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    //  Authentication check
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ Fetch user along with role & affiliate info
    const me = await prisma.users.findUnique({
      where: { id: Number(userId) },
      include: {
        role: true,
        affiliate: { select: { id: true } },
      },
    });

    if (!me || !me.role?.name) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const role = me.role.name.toLowerCase();
    const isAdmin = role === "admin";
    const isAffiliate = role === "affiliate";

    // ✅ Only admin and affiliate are allowed
    if (!isAdmin && !isAffiliate) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // ✅ If affiliate - ensure the affiliate record exists
    if (isAffiliate && !me.affiliate?.id) {
      return NextResponse.json({ message: "Affiliate profile not found" }, { status: 403 });
    }



    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    //  Search conditions — removed mode for MySQL
    const where: any = search
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

    //  If affiliate → only show their own orders
    if (isAffiliate) {
      where.affiliateId = me.affiliate.id;
    }

    //  Fetch orders
    const orders = await prisma.orders.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },

        //  Return affiliate info (if order came via affiliate)
        affiliate: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },


        //  Return coupon info (if coupon used)
        coupon: {
          select: {
            id: true,
            code: true,
            discountType: true,
            discountValue: true,
            affiliateId: true,
          },
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
            reviewed: true
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // 🧠 Add review data per order item using your helper
    const formattedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const updatedItems = await Promise.all(
          order.orderItems.map(async (item: any) => {
            const review = await getReviewDetails(item.id);

            return {
              ...item,
              review: review,
              // reviewed: !!review, // ✅ true if a review exists
            };
          })
        );

        return { ...order, orderItems: updatedItems };
      })
    );

    return NextResponse.json({ success: true, data: formattedOrders });
    // return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Orders GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}




// export async function GET(req: NextRequest) {
//   try {
//     const userId = await checkAuth(req);
//     if (!userId) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//     }

//     const orders = await prisma.orders.findMany({
//       where: { userId: Number(userId) },
//       include: {
//         orderItems: {
//           include: {
//             product: {
//               select: {
//                 id: true,
//                 title: true,
//                 productimage: { select: { url: true }, take: 1 },
//               },
//             },
//             variant: {
//               select: {
//                 id: true,
//                 sku: true,
//                 color: { select: { name: true } },
//                 size: { select: { name: true } },
//               },
//             },
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     // 🧠 Attach review data for each item using helper
//     const formattedOrders = await Promise.all(
//       orders.map(async (order:any) => ({
//         ...order,
//         orderItems: await Promise.all(
//           order.orderItems.map(async (item:any) => {
//             const reviewDetails = await getReviewDetails(item.id, Number(userId));
//             return {
//               ...item,
//               review: reviewDetails,
//               reviewed: !!reviewDetails,
//             };
//           })
//         ),
//       }))
//     );

//     return NextResponse.json({ success: true, data: formattedOrders });
//   } catch (error) {
//     console.error("❌ Orders GET Error:", error);
//     return NextResponse.json(
//       { success: false, message: "Failed to fetch orders" },
//       { status: 500 }
//     );
//   }
// }
