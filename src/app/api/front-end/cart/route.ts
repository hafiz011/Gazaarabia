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
                variantImages: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    //  Add selectedVariantData for each cart item
    const enrichedItems = items.map((item: any) => {
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
          variantImages: selectedVariant.variantImages || []
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
    console.error("PUT /cart error:", error);
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
    const enrichedItems = items.map((item: any) => {
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
    return NextResponse.json({ message: "Product removed from cart", cart: enrichedItems, subtotal });
  } catch (error: any) {
    console.error("Remove from cart error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
