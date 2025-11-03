// import { NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { getAvailableQuantity } from "@/lib/helpers/stockHelper";

// const prisma = new PrismaClient();

// /**
//  * Validate guest cart items against live stock.
//  * Expects: { cartItems: [{ productId, variantId, quantity, productName? }] }
//  */
// export async function POST(req: Request) {
//   try {
//     const { cartItems } = await req.json();

//     if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "No cart items found." },
//         { status: 400 }
//       );
//     }

//     // Run all stock checks in parallel
//     const results = await Promise.all(
//       cartItems.map(async (item: any) => {
//         const availableStock = await getAvailableQuantity({
//           productId: item.productId,
//           variantId: item.variantId,
//         });

//         if (availableStock < item.quantity) {
//           return {
//             productId: item.productId,
//             variantId: item.variantId,
//             name: item.productName || "Unknown Product",
//             availableStock,
//             requestedQuantity: item.quantity,
//           };
//         }
//         return null;
//       })
//     );

//     const unavailableItems = results.filter(Boolean);

//     if (unavailableItems.length > 0) {
//       return NextResponse.json(
//         {
//           success: false,
//           message:
//             "Some items are out of stock or insufficient quantity available.",
//           unavailableItems,
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json({ success: true }, { status: 200 });
//   } catch (error) {
//     console.error("Guest cart validation error:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }


import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getAvailableQuantity } from "@/lib/helpers/stockHelper";

const prisma = new PrismaClient();

/**
 * Validate guest cart items against live data.
 * Expects:
 * {
 *   cartItems: [
 *     {
 *       productId,
 *       variantId?,
 *       quantity,
 *       productName?,
 *       price // client-side price (to detect mismatch)
 *     }
 *   ]
 * }
 */
export async function POST(req: Request) {
  try {
    const { cartItems } = await req.json();

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "No cart items found." },
        { status: 400 }
      );
    }

    // Extract unique IDs
    const productIds = [...new Set(cartItems.map((i) => i.productId).filter(Boolean))];
    const variantIds = [...new Set(cartItems.map((i) => i.variantId).filter(Boolean))];

    // Fetch all products and variants
    const [products, variants] = await Promise.all([
      prisma.products.findMany({
        where: { id: { in: productIds } },
        select: {
          id: true,
          title: true,
          active: true,
          sellingPrice: true,
        },
      }),
      prisma.productvariant.findMany({
        where: { id: { in: variantIds } },
        select: {
          id: true,
          productId: true,
          isActive: true,
          price: true,
          stock: true,
        },
      }),
    ]);

    // Create lookup maps
    const productMap = new Map(products.map((p) => [p.id, p]));
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Validate all items
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

        // ✅ Stock validation
        if (issues.length === 0) {
          availableStock = await getAvailableQuantity({
            productId: item.productId,
            variantId: item.variantId,
          });

          if (availableStock < item.quantity) {
            issues.push(`Only ${availableStock} item(s) available in stock.`);
          }
        }

        // ✅ Price validation (Fixed)
        if (issues.length === 0) {
          const livePrice = Number(variant?.price ?? product?.sellingPrice ?? 0);
          const clientPrice = Number(item.price ?? 0);

          // Compare with small tolerance to handle float precision issues
          const priceDifference = Math.abs(livePrice - clientPrice);

          if (priceDifference > 0.01) {
            issues.push(
              `Price has been updated. Current price: £${livePrice.toFixed(2)}`
            );
          }
        }

        // Return problem if found
        if (issues.length > 0) {
          return {
            productId: item.productId,
            variantId: item.variantId,
            name: product?.title || item.productName || "Unknown Product",
            availableStock,
            requestedQuantity: item.quantity,
            issues,
          };
        }

        return null;
      })
    );

    const unavailableItems = validationResults.filter(Boolean);

    if (unavailableItems.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Some items are invalid, inactive, have incorrect price, or insufficient stock.",
          unavailableItems,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Guest cart validation error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
