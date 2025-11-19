import { NextResponse } from "next/server";
import { PrismaClient, products, productvariant } from "@prisma/client";
import { getTokenFromHeader, getUserIdFromToken } from "@/lib/authToken";
import { getAvailableQuantity } from "@/lib/helpers/stockHelper";
import { prisma } from "@/lib/prisma";

// const prisma = new PrismaClient();

// ----------  Type Definitions ----------

interface SelectedVariantData {
  id?: number | null;
  sizeId?: number | null;
  colorId?: number | null;
  sizeName?: string | null;
  colorName?: string | null;
  hexCode?: string | null;
  price?: number | null;
  availableStock?: number | null;
  variantImages?: Array<Record<string, any>>;
}

interface CartItemInput {
  productId: number;
  variantId?: number | null;
  colorId?: number | null;
  sizeId?: number | null;
  quantity: number;
  price?: number;
  productName?: string;
  selectedVariantData?: SelectedVariantData;
  product?: Partial<products>;
  variant?: Partial<productvariant>;
  frontendPrice?: number | null;
}

interface SyncResponse {
  success: boolean;
  syncedCart: CartItemInput[];
  subtotal: number;
  changes: {
    removed: number;
    priceUpdated: number;
    quantityUpdated: number;
  };
  issues: Array<{
    name: string;
    requestedQuantity: number;
    availableStock: number;
    issues: string[];
  }>;
}

// ----------  Safe findMany Helper ----------

async function safeFindMany<T>(
  model: any,
  ids: number[],
  select: Record<string, boolean>
): Promise<T[]> {
  if (!ids || ids.length === 0) return [];
  return model.findMany({ where: { id: { in: ids } }, select });
}

// ----------  Sync Cart Route ----------

export async function POST(req: Request): Promise<NextResponse<SyncResponse | { success: false; message: string }>> {
  try {
    const token: any = getTokenFromHeader(req);
    const userId = getUserIdFromToken(token);
    const isGuest = !userId;

    // --- Safe body parse ---
    let body: any = {};
    try {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    } catch {
      body = {};
    }

    const cartItems: CartItemInput[] = body?.cartItems || [];

    if (!cartItems.length) {
      return NextResponse.json(
        { success: false, message: "Cart is empty." },
        { status: 400 }
      );
    }

    // --- Logged-in: use DB cart ---
    let finalCartItems: CartItemInput[] = cartItems;
    if (!isGuest && userId) {
      const dbCart = await prisma.cart.findMany({
        where: { userId },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              active: true,
              sellingPrice: true,
            },
          },
          variant: {
            select: {
              id: true,
              productId: true,
              isActive: true,
              price: true,
              stock: true,
              sizeId: true,
              colorId: true,
            },
          },
        },
      });

      finalCartItems = dbCart.map((dbItem: any) => {
        const frontendItem = cartItems.find(
          (ci) =>
            ci.productId === dbItem.productId &&
            ci.variantId === dbItem.variantId
        );
        return {
          ...dbItem,
          frontendPrice:
            frontendItem?.selectedVariantData?.price ??
            frontendItem?.product?.sellingPrice ??
            null,
        };
      });
    }

    // --- Extract IDs safely ---
    const productIds = Array.from(
      new Set(
        finalCartItems
          .map((i) => Number(i.productId))
          .filter((id) => !isNaN(id))
      )
    );

    const variantIds = Array.from(
      new Set(
        finalCartItems
          .map((i) => Number(i.variantId))
          .filter((id) => !isNaN(id))
      )
    );

    // --- Fetch live data safely ---
    const [products, variants] = await Promise.all([
      safeFindMany<products>(prisma.products, productIds, {
        id: true,
        title: true,
        active: true,
        sellingPrice: true,
      }),
      safeFindMany<productvariant>(prisma.productvariant, variantIds, {
        id: true,
        productId: true,
        isActive: true,
        price: true,
        stock: true,
        sizeId: true,
        colorId: true,
      }),
    ]);

    const productMap = new Map<number, products>(products.map((p) => [p.id, p]));
    const variantMap = new Map<number, productvariant>(variants.map((v) => [v.id, v]));

    const syncedCart: CartItemInput[] = [];
    const changes = { removed: 0, priceUpdated: 0, quantityUpdated: 0 };
    const issues: SyncResponse["issues"] = [];

    // --- Validate each cart item ---
    for (const item of finalCartItems) {
      const product = productMap.get(item.productId);
      const variant: any = item.variantId ? variantMap.get(item.variantId) : null;
      const itemIssues: string[] = [];
      let availableStock = 0;
      let priceChanged = false;

      // 1️ Product/variant validity
      if (!product || !product.active) {
        itemIssues.push("Product no longer exists or is inactive.");
      } else if (item.variantId && (!variant || !variant.isActive)) {
        itemIssues.push("Variant is no longer available.");
      }

      // 2️ Stock validation
      if (itemIssues.length === 0) {
        availableStock = await getAvailableQuantity({
          productId: item.productId,
          variantId: Number(item.variantId),
        });

        if (availableStock <= 0) {
          itemIssues.push("Out of stock.");
        } else if (item.quantity > availableStock) {
          itemIssues.push(
            `Only ${availableStock} item(s) available. Quantity reduced.`
          );
        }
      }

      // 3️ Price validation
      const livePrice = Number(variant?.price ?? product?.sellingPrice ?? 0);
      const oldPrice = (!isGuest && userId) ? Number(item.frontendPrice ?? item.price ?? 0) :
        Number(item.selectedVariantData?.price ?? item.product?.sellingPrice ?? 0)
        ;

      if (Number.isFinite(livePrice) && Number.isFinite(oldPrice)) {
        const priceDiff = Math.abs(livePrice - oldPrice);
        if (priceDiff >= 0.01) {
          const increased = livePrice > oldPrice;
          itemIssues.push(
            increased
              ? `Price increased from £${oldPrice.toFixed(2)} → £${livePrice.toFixed(2)}`
              : `Price decreased from £${oldPrice.toFixed(2)} → £${livePrice.toFixed(2)}`
          );
          priceChanged = true;
        }
      }

      // Record issues
      if (itemIssues.length > 0) {
        issues.push({
          name: product?.title || item.productName || "Unknown Product",
          requestedQuantity: item.quantity,
          availableStock,
          issues: itemIssues,
        });

        if (priceChanged) changes.priceUpdated++;

        if (!isGuest) {
          // remove invalid/out-of-stock
          if (
            itemIssues.some((msg) =>
              ["no longer", "inactive", "Out of stock"].some((x) =>
                msg.includes(x)
              )
            )
          ) {
            changes.removed++;
            continue;
          }

          // reduce quantity
          if (itemIssues.some((msg) => msg.includes("Quantity reduced"))) {
            item.quantity = availableStock;
            changes.quantityUpdated++;
          }
        }
      }

      //  Build synced item
      syncedCart.push({
        ...item,
        product,
        variant,
        price: livePrice,
        quantity: item.quantity,
        selectedVariantData: {
          ...(item.selectedVariantData || {}),
          id: variant?.id ?? item.variantId ?? null,
          sizeId: variant?.sizeId ?? item.selectedVariantData?.sizeId ?? null,
          colorId: variant?.colorId ?? item.selectedVariantData?.colorId ?? null,
          sizeName: item.selectedVariantData?.sizeName ?? null,
          colorName: item.selectedVariantData?.colorName ?? null,
          hexCode: item.selectedVariantData?.hexCode ?? null,
          price: livePrice,
          availableStock:
            variant?.stock ??
            availableStock ??
            item.selectedVariantData?.availableStock ??
            0,
          variantImages: item.selectedVariantData?.variantImages ?? [],
        },
      });
    }

    // --- DB update for logged-in users ---
    if (!isGuest && userId) {
      const validVariantIds = syncedCart
        .map((i) => i.variantId)
        .filter((id): id is number => Boolean(id));

      await prisma.cart.deleteMany({
        where: { userId, variantId: { notIn: validVariantIds } },
      });

      await Promise.all(
        syncedCart.map((item) =>
          prisma.cart.updateMany({
            where: {
              userId,
              productId: item.productId,
              variantId: item.variantId ?? undefined,
            },
            data: {
              quantity: item.quantity,
              updatedAt: new Date(),
            },
          })
        )
      );
    }

    // --- Subtotal ---
    const subtotal = syncedCart.reduce(
      (sum, i) => sum + Number(i.price ?? 0) * Number(i.quantity ?? 0),
      0
    );

    // --- Final response ---
    return NextResponse.json(
      { success: true, syncedCart, subtotal, changes, issues },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cart sync error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error." },
      { status: 500 }
    );
  }
}


