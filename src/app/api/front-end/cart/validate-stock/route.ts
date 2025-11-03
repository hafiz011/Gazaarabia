// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
// import {
//     getAvailableQuantity,
// } from "@/lib/helpers/stockHelper";

// const prisma = new PrismaClient();

// export async function GET(req: Request) {
//     try {
//         const token: any = getTokenFromHeader(req);
//         const userId = getUserIdFromToken(token);
//         if (!userId) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         // Fetch cart items with minimal required fields
//         const cartItems = await prisma.cart.findMany({
//             where: { userId },
//             include: {
//                 product: { select: { id: true, title: true, baseQty: true, active: true } },
//                 variant: { select: { id: true, stock: true, isActive: true, sku: true } },
//             },
//         });

//         if (!cartItems || cartItems.length === 0) {
//             return NextResponse.json(
//                 { success: false, message: "Cart is empty", unavailableItems: [] },
//                 { status: 400 }
//             );
//         }

//         // Run all stock checks in parallel
//         const validationResults = await Promise.all(
//             cartItems.map(async (item) => {
//                 const availableStock = await getAvailableQuantity({
//                     variantId: item.variantId,
//                     productId: item.productId,
//                 });

//                 if (availableStock < item.quantity) {
//                     return {
//                         productId: item.productId,
//                         variantId: item.variantId,
//                         name: item.product.title,
//                         availableStock,
//                         requestedQuantity: item.quantity,
//                     };
//                 }

//                 return null; // means it's okay
//             })
//         );

//         // Filter out unavailable items
//         const unavailableItems = validationResults.filter((i) => i !== null);

//         if (unavailableItems.length > 0) {
//             return NextResponse.json(
//                 {
//                     success: false,
//                     message: "Some items are out of stock or insufficient quantity available.",
//                     unavailableItems,
//                 },
//                 { status: 400 }
//             );
//         }

//         //  All good
//         return NextResponse.json({ success: true }, { status: 200 });
//     } catch (error) {
//         console.error("Error validating cart stock:", error);
//         return NextResponse.json(
//             { success: false, error: "Internal server error" },
//             { status: 500 }
//         );
//     }
// }



import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getAvailableQuantity } from "@/lib/helpers/stockHelper";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    // 🔹 Auth check
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🔹 Fetch cart items
    const cartItems = await prisma.cart.findMany({
      where: { userId },
      select: {
        id: true,
        productId: true,
        variantId: true,
        quantity: true,
      },
    });

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty", unavailableItems: [] },
        { status: 400 }
      );
    }

    // 🔹 Collect unique product & variant IDs
    const productIds = [
      ...new Set(cartItems.map((i) => i.productId).filter(Boolean)),
    ];
    const variantIds = [
      ...new Set(cartItems.map((i) => i.variantId).filter(Boolean)),
    ];

    // 🔹 Fetch all required products & variants in one go
    const [products, variants] = await Promise.all([
      prisma.products.findMany({
        where: { id: { in: productIds } },
        select: { id: true, title: true, active: true },
      }),
      prisma.productvariant.findMany({
        where: { id: { in: variantIds } },
        select: { id: true, isActive: true, stock: true },
      }),
    ]);

    // 🔹 Create maps for quick lookup
    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // 🔹 Validate all cart items
    const validationResults = await Promise.all(
      cartItems.map(async (item) => {
        const issues: string[] = [];
        let availableStock = 0;

        // ✅ Product validation
        const product = productMap.get(item.productId);
        if (!product) {
          issues.push("Product no longer exists.");
        } else if (!product.active) {
          issues.push("Product is inactive.");
        }

        // ✅ Variant validation
        let variant = null;
        if (item.variantId) {
          variant = variantMap.get(item.variantId);
          if (!variant) {
            issues.push("Variant no longer exists.");
          } else if (!variant.isActive) {
            issues.push("Variant is inactive.");
          }
        }

        // ✅ Stock validation (only if product/variant valid)
        if (issues.length === 0) {
          availableStock = await getAvailableQuantity({
            variantId: item.variantId,
            productId: item.productId,
          });

          if (availableStock < item.quantity) {
            issues.push(`Only ${availableStock} item(s) available in stock.`);
          }
        }

        // ✅ Return issue details if any
        if (issues.length > 0) {
          return {
            productId: item.productId,
            variantId: item.variantId,
            name: product?.title || "Unknown Product",
            availableStock,
            requestedQuantity: item.quantity,
            issues,
          };
        }

        return null;
      })
    );

    // 🔹 Filter out unavailable items
    const unavailableItems = validationResults.filter((i) => i !== null);

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Some items are invalid, inactive, or have insufficient stock.",
          unavailableItems,
        },
        { status: 400 }
      );
    }

    // ✅ All good
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error validating cart stock:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
