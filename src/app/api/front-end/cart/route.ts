import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";

const prisma :any= new PrismaClient();

//  Helper to calculate subtotal
async function calculateSubtotal(userId: any) {
  const items = await prisma.cart.findMany({
    where: { userId },
    include: { product: true },
  });
  return items.reduce(
    (sum:any, item:any) => sum + item.product.sellingPrice * item.quantity,
    0
  );
}

//  Add product to cart
export async function POST(req: Request) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { productId, quantity = 1 , colorId, sizeId, variantId} = await req.json();
    if (!productId || !colorId || !sizeId ||  !variantId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }
    if ( !colorId ) {
      return NextResponse.json({ error: "Color ID is required" }, { status: 400 });
    }
    if ( !sizeId ) {
      return NextResponse.json({ error: "Size ID is required" }, { status: 400 });
    }
    if (!variantId) {
      return NextResponse.json({ error: "Variant ID is required" }, { status: 400 });
    }

const existing = await prisma.cart.findUnique({
  where: {
    userId_variantId: {
      userId,
      variantId,
    },
  },
});

if (existing) {
  await prisma.cart.update({
    where: {
      userId_variantId: {
        userId,
        variantId,
      },
    },
    data: {
      quantity: existing.quantity + quantity,
    },
  });
} else {
  await prisma.cart.create({
    data: {
      userId,
      productId,
      variantId,
      colorId,
      sizeId,
      quantity,
    },
  });
}


    const subtotal = await calculateSubtotal(userId);
    return NextResponse.json({ message: "Added to cart", subtotal });
  } catch (error: any) {
    console.error("❌ Add to cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

//  Remove product from cart
// export async function DELETE(req: Request) {
//   try {
//     const token: any = getTokenFromHeader(req);
//     const userId = getUserIdFromToken(token);
//     if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const { productId } = await req.json();
//     if (!productId) {
//       return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
//     }

//     await prisma.cart.delete({
//       where: { userId_productId: { userId, productId } },
//     });

//     const subtotal = await calculateSubtotal(userId);
//     return NextResponse.json({ message: "Product removed from cart", subtotal });
//   } catch (error: any) {
//     console.error("❌ Remove from cart error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// 📦 Get all items in user’s cart


export async function GET(req: Request) {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    //  Add selectedVariantData for each cart item
    const enrichedItems = items.map((item:any) => {
      const selectedVariant = item.product.productvariant.find(
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
          }
        : null;

      return {
        ...item,
        selectedVariantData,
      };
    });

    const subtotal = enrichedItems.reduce(
      (sum: number, item: any) =>
        sum +
        (item.selectedVariantData?.price ?? item.product.sellingPrice) *
          item.quantity,
      0
    );

    return NextResponse.json({ cart: enrichedItems, subtotal });
  } catch (error: any) {
    console.error("Get cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


// //  Update quantity
// export async function PUT(req: Request) {
//   try {
//     const token = getTokenFromHeader(req);
//     if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const userId = getUserIdFromToken(token);
//     const { productId, quantity } = await req.json();

//     if (!productId || !quantity || quantity <= 0) {
//       return NextResponse.json({ error: "Invalid quantity or product" }, { status: 400 });
//     }

//     const cartItem = await prisma.cart.findUnique({
//       where: { userId_productId: { userId, productId } },
//     });

//     if (!cartItem) {
//       return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
//     }

//     await prisma.cart.update({
//       where: { userId_productId: { userId, productId } },
//       data: { quantity },
//     });

//     const subtotal = await calculateSubtotal(userId);
//     return NextResponse.json({ message: "Quantity updated", subtotal });
//   } catch (error: any) {
//     console.error( PUT /cart error:", error);
//     return NextResponse.json({ error: error.message || "Failed to update quantity" }, { status: 500 });
//   }
// }


//  Update quantity
export async function PUT(req: Request) {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = getUserIdFromToken(token);
    const { variantId, quantity } = await req.json();

    if (!variantId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity or variant" }, { status: 400 });
    }

    const cartItem = await prisma.cart.findUnique({
      where: { userId_variantId: { userId, variantId } },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await prisma.cart.update({
      where: { userId_variantId: { userId, variantId } },
      data: { quantity },
    });

    const subtotal = await calculateSubtotal(userId);
    return NextResponse.json({ message: "Quantity updated", subtotal });
  } catch (error: any) {
    console.error("❌ PUT /cart error:", error);
    return NextResponse.json({ error: error.message || "Failed to update quantity" }, { status: 500 });
  }
}


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



    // get the updated cart data
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
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Add selectedVariantData for each cart item
    const enrichedItems = items.map((item:any) => {
      const selectedVariant = item.product.productvariant.find(
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
          }
        : null;

      return {
        ...item,
        selectedVariantData,
      };
    });

    const subtotal = await calculateSubtotal(userId);
    return NextResponse.json({ message: "Product removed from cart", cart:enrichedItems,  subtotal });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
