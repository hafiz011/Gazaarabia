import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkAuth } from "@/lib/authToken"; // your JWT verification helper

const prisma :any = new PrismaClient();

/**
 * @route GET /api/front-end/orders/[id]
 * @desc Get single order by ID with selected variant data
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    //  Authenticate user
    const userId = await checkAuth(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Await params before using
    const { id } = await context.params;
    const orderId = Number(id);
    if (isNaN(orderId)) {
      return NextResponse.json({ message: "Invalid order ID" }, { status: 400 });
    }

    //  Fetch order with products and variants
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
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
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    //  Ensure user can only access their own order
    if (order.userId !== userId) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Enrich orderItems with selected variant details
    const enrichedOrderItems = order.orderItems.map((item: any) => {
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
        reviewed: item.reviewed,
      };
    });

    const enrichedOrder = {
      ...order,
      orderItems: enrichedOrderItems,
    };

    return NextResponse.json({
      success: true,
      message: "Order fetched successfully",
      data: enrichedOrder,
    });
  } catch (error) {
    console.error(" GET Order by ID Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}
