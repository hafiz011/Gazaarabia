import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getProductAvailableQuantity, getVariantAvailableQuantity } from "@/lib/helpers/stockHelper";

const prisma: any = new PrismaClient();

//  Helper to calculate subtotal (supports product + variant pricing)
async function calculateSubtotal(userId: any) {
  const items = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        select: { sellingPrice: true },
      },
      variant: {
        select: { price: true },
      },
    },
  });

  const subtotal = items.reduce((sum: any, item: any) => {
    // If variant exists → use variant price
    const price = item.variant?.price ?? item.product?.sellingPrice ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return subtotal;
}


// Helper to get the updated cart data
async function getUpdatedCartData(userId: any) {
  const items = await prisma.cart.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          productimage: true,
          productvariant: {
            include: {
              color: true,
              size: true,
              variantImages: true
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Add variant & product stock for each cart item
  const enrichedItems = await Promise.all(
    items.map(async (item: any) => {
      const product = item.product;

      // 1️. Calculate product-level available stock
      const productAvailableStock = await getProductAvailableQuantity(product.id);

      // 2️. Add available stock for each variant in the product
      const variantsWithStock = await Promise.all(
        product.productvariant.map(async (variant: any) => {
          const variantAvailableStock = await getVariantAvailableQuantity(variant.id);
          return {
            ...variant,
            availableStock: variantAvailableStock, //  new field
          };
        })
      );

      // 3️. Determine selected variant
      const selectedVariant = variantsWithStock.find(
        (variant: any) => variant.id === item.variantId
      );

      const selectedVariantData = selectedVariant
        ? {
          id: selectedVariant.id,
          sizeId: selectedVariant.sizeId,
          colorId: selectedVariant.colorId,
          sizeName: selectedVariant.size?.name || null,
          colorName: selectedVariant.color?.name || null,
          hexCode: selectedVariant.color?.hexCode || null,
          price: selectedVariant.price,
          availableStock: selectedVariant.availableStock,
          variantImages: selectedVariant.variantImages
        }
        : null;

      // 4️. Compute item-level available stock
      const itemAvailableStock = selectedVariant
        ? selectedVariant.availableStock
        : productAvailableStock;

      // 5️. Return final structured item
      return {
        ...item,
        selectedVariantData,
        availableStock: itemAvailableStock, // stock for cart item
        product: {
          ...product,
          availableStock: productAvailableStock, // stock for product
          productvariant: variantsWithStock, // each variant with stock
        },
      };
    })
  );

  return enrichedItems;
}



// async function getUpdatedCartData(userId: any) {
//   const items = await prisma.cart.findMany({
//     where: { userId },
//     include: {
//       product: {
//         include: {
//           productimage: true,
//           productvariant: {
//             include: {
//               color: true,
//               size: true,
//             },
//           },
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   // Add selectedVariantData for each cart item
//   const enrichedItems = items.map((item: any) => {
//     const selectedVariant = item.product.productvariant.find(
//       (variant: any) => variant.id === item.variantId
//     );

//     const selectedVariantData = selectedVariant
//       ? {
//         id: selectedVariant.id,
//         sizeId: selectedVariant.sizeId,
//         colorId: selectedVariant.colorId,
//         sizeName: selectedVariant.size?.name || null,
//         colorName: selectedVariant.color?.name || null,
//         hexCode: selectedVariant.color?.hexCode || null,
//         price: selectedVariant.price,
//       }
//       : null;

//     return {
//       ...item,
//       selectedVariantData,
//     };
//   });

//   return enrichedItems;
// }

export async function POST(req: Request) {
  try {
    //  Auth check
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //  Parse request body
    const { productId, quantity = 1, colorId, sizeId, variantId } = await req.json();

    //  Validate required fields
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    if (!colorId) {
      return NextResponse.json({ error: "Color ID is required" }, { status: 400 });
    }
    if (!sizeId) {
      return NextResponse.json({ error: "Size ID is required" }, { status: 400 });
    }

    // Step 1: Get available quantity dynamically
    let availableStock = 0;

    if (variantId) {
      // check variant stock
      availableStock = await getVariantAvailableQuantity(variantId);
    } else {
      // check product stock via baseQty
      availableStock = await getProductAvailableQuantity(productId);
    }

    //  Step 2: Validate stock
    if (availableStock <= 0) {
      return NextResponse.json(
        { error: "This item is out of stock." },
        { status: 400 }
      );
    }

    // Step 3: Check if the product/variant already exists in the user's cart
    const existing = variantId
      ? await prisma.cart.findUnique({
        where: {
          userId_variantId: {
            userId,
            variantId,
          },
        },
      })
      : await prisma.cart.findFirst({
        where: {
          userId,
          productId,
        },
      });

    // Step 4: Calculate total requested quantity
    let totalRequestedQty = quantity;
    if (existing) {
      totalRequestedQty = existing.quantity + quantity;
    }

    //  Step 5: Validate against available stock
    if (totalRequestedQty > availableStock) {
      return NextResponse.json(
        {
          error: `Only ${availableStock} item(s) are available in stock.`,
        },
        { status: 400 }
      );
    }

    //  Step 6: Update or create cart item
    if (existing) {
      await prisma.cart.update({
        where: variantId
          ? {
            userId_variantId: {
              userId,
              variantId,
            },
          }
          : { id: existing.id },
        data: {
          quantity: totalRequestedQty,
        },
      });
    } else {
      await prisma.cart.create({
        data: {
          userId,
          productId,
          variantId: variantId || null,
          colorId,
          sizeId,
          quantity,
        },
      });
    }

    //  Step 7: Recalculate subtotal
    const subtotal = await calculateSubtotal(userId);

    return NextResponse.json({
      message: "Item added to cart successfully",
      subtotal,
    });
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ================= get the cart data ==========
    const updatedCartData = await getUpdatedCartData(userId);

    const subtotal = await calculateSubtotal(userId);

    return NextResponse.json({ cart: updatedCartData, subtotal });
  } catch (error: any) {
    console.error("Get cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


//  Update quantity
export async function PUT(req: Request) {
  try {
    // Step 1: Auth check
    const token = getTokenFromHeader(req);
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = getUserIdFromToken(token);

    // Step 2: Parse request body
    const { productId, variantId, quantity } = await req.json();

    // Step 3: Validate request data
    if ((!variantId && !productId) || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid quantity or missing product/variant" },
        { status: 400 }
      );
    }

    // Step 4: Fetch cart item
    const cartItem = variantId
      ? await prisma.cart.findUnique({
        where: { userId_variantId: { userId, variantId } },
      })
      : await prisma.cart.findFirst({
        where: { userId, productId },
      });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // // Step 5: Get available stock dynamically
    // let availableStock = 0;
    // if (variantId) {
    //   availableStock = await getVariantAvailableQuantity(variantId);
    // } else {
    //   availableStock = await getProductAvailableQuantity(productId);
    // }

    // // Step 6: Validate requested quantity vs available stock
    // if (quantity > availableStock) {
    //   return NextResponse.json(
    //     {
    //       error: `Only ${availableStock} item(s) are available in stock.`,
    //     },
    //     { status: 400 }
    //   );
    // }

    // if (availableStock <= 0) {
    //   return NextResponse.json(
    //     { error: "This item is out of stock." },
    //     { status: 400 }
    //   );
    // }


    // Step 6: Validate requested quantity vs available stock
    if (quantity > cartItem.quantity) {
      //  User is trying to INCREASE the quantity → validate stock availability

      let availableStock = 0;

      if (variantId) {
        availableStock = await getVariantAvailableQuantity(variantId);
      } else {
        availableStock = await getProductAvailableQuantity(productId);
      }

      if (availableStock <= 0) {
        return NextResponse.json(
          { error: "This item is currently out of stock." },
          { status: 400 }
        );
      }

      if (quantity > availableStock) {
        return NextResponse.json(
          {
            error: `Only ${availableStock} item(s) are available in stock.`,
          },
          { status: 400 }
        );
      }
    }

    // If quantity is being decreased or stays the same, allow without stock validation

    // Step 7: Update cart quantity
    await prisma.cart.update({
      where: variantId
        ? { userId_variantId: { userId, variantId } }
        : { id: cartItem.id },
      data: { quantity },
    });

    // Step 8: Recalculate subtotal and cart data
    const updatedCartData = await getUpdatedCartData(userId);
    const subtotal = await calculateSubtotal(userId);

    return NextResponse.json({
      message: "Quantity updated successfully",
      subtotal,
      cart: updatedCartData,
    });
  } catch (error: any) {
    console.error("PUT /cart error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update quantity" },
      { status: 500 }
    );
  }
}
// export async function PUT(req: Request) {
//   try {
//     // Step 1: Auth check
//     const token = getTokenFromHeader(req);
//     if (!token)
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const userId = getUserIdFromToken(token);

//     // Step 2: Parse request body
//     const { productId, variantId, quantity } = await req.json();

//     // Step 3: Validate request data
//     if ((!variantId && !productId) || !quantity || quantity <= 0) {
//       return NextResponse.json(
//         { error: "Invalid quantity or missing product/variant" },
//         { status: 400 }
//       );
//     }

//     // Step 4: Fetch cart item
//     const cartItem = variantId
//       ? await prisma.cart.findUnique({
//         where: { userId_variantId: { userId, variantId } },
//       })
//       : await prisma.cart.findFirst({
//         where: { userId, productId },
//       });

//     if (!cartItem) {
//       return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
//     }

//     // Step 5: Get available stock dynamically
//     let availableStock = 0;
//     if (variantId) {
//       availableStock = await getVariantAvailableQuantity(variantId);
//     } else {
//       availableStock = await getProductAvailableQuantity(productId);
//     }

//     // Step 6: Validate requested quantity vs available stock
//     if (quantity > availableStock) {
//       return NextResponse.json(
//         {
//           error: `Only ${availableStock} item(s) are available in stock.`,
//         },
//         { status: 400 }
//       );
//     }

//     if (availableStock <= 0) {
//       return NextResponse.json(
//         { error: "This item is out of stock." },
//         { status: 400 }
//       );
//     }

//     // Step 7: Update cart quantity
//     await prisma.cart.update({
//       where: variantId
//         ? { userId_variantId: { userId, variantId } }
//         : { id: cartItem.id },
//       data: { quantity },
//     });

//     // Step 8: Recalculate subtotal and cart data
//     const updatedCartData = await getUpdatedCartData(userId);
//     const subtotal = await calculateSubtotal(userId);

//     return NextResponse.json({
//       message: "Quantity updated successfully",
//       subtotal,
//       cart: updatedCartData,
//     });
//   } catch (error: any) {
//     console.error("PUT /cart error:", error);
//     return NextResponse.json(
//       { error: error.message || "Failed to update quantity" },
//       { status: 500 }
//     );
//   }
// }



// Remove product from cart
export async function DELETE(req: Request) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { variantId } = await req.json();
    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

    await prisma.cart.delete({
      where: { userId_variantId: { userId, variantId } },
    });


    // ================= get the cart data again
    const updatedCartData = await getUpdatedCartData(userId);

    const subtotal = await calculateSubtotal(userId);
    return NextResponse.json({ message: "Product removed from cart", cart: updatedCartData, subtotal });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
