import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Get available (remaining) stock for a specific variant
 * available = productvariant.stock - sum(ordered qty for that variant in completed orders)
 */
export async function getVariantAvailableQuantity(variantId: number): Promise<number> {
    // fetch variant stock & active flag
    const variant = await prisma.productvariant.findUnique({
        where: { id: variantId },
        select: { stock: true, isActive: true },
    });

    if (!variant || !variant.isActive) return 0;

    // sum ordered quantities for this variant where order.status indicates completed/paid
    const ordered = await prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
            variantId,
            order: {
                status: { in: ["paid", "completed", "success"] }, // adjust statuses to match your app
            },
        },
    });

    const orderedQty = ordered._sum.quantity ?? 0;
    const available = variant.stock - orderedQty;

    return available > 0 ? available : 0;
}

/**
 * Get available (remaining) stock for a product using products.baseQty as source of truth
 * available = products.baseQty - sum(ordered qty for that product in completed orders)
 */
export async function getProductAvailableQuantity(productId: number): Promise<number> {
    // fetch product baseQty and (optionally) active flag
    const product = await prisma.products.findUnique({
        where: { id: productId },
        select: { baseQty: true, active: true },
    });

    if (!product || product.baseQty == null || product.active === false) {
        return 0;
    }

    // sum ordered quantities for this product where order.status indicates completed/paid
    const ordered = await prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
            productId,
            order: {
                status: { in: ["paid", "completed", "success"] }, // adjust according to your statuses
            },
        },
    });

    const orderedQty = ordered._sum.quantity ?? 0;
    const available = product.baseQty - orderedQty;

    return available > 0 ? available : 0;
}

/**
 * Optional wrapper: prefer variant check if variantId provided; else product check
 */
export async function getAvailableQuantity(params: {
    variantId?: number;
    productId?: number;
}): Promise<number> {
    const { variantId, productId } = params;
    if (variantId) return getVariantAvailableQuantity(variantId);
    if (productId) return getProductAvailableQuantity(productId);
    throw new Error("Please provide variantId or productId");
}
