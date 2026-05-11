import { prisma } from "@/lib/prisma";

/**
 * Get available (remaining) stock for multiple products in a single batch (Fixes N+1)
 */
export async function getBulkProductAvailableStock(productIds: number[]) {
    if (productIds.length === 0) return new Map<number, number>();

    // 1. Fetch products baseQty with minimal select
    const products = await prisma.products.findMany({
        where: { id: { in: productIds } },
        select: { id: true, baseQty: true }
    });

    // 2. Fetch sum of sold quantities in a single aggregation
    const sales = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
            productId: { in: productIds },
            order: {
                status: { in: ["paid", "completed", "success", "succeeded"] },
            }
        },
        _sum: { quantity: true }
    });

    const salesMap = new Map(sales.map(s => [s.productId, s._sum.quantity || 0]));
    
    // 3. Map result
    const stockMap = new Map<number, number>();
    products.forEach(p => {
        const sold = salesMap.get(p.id) || 0;
        const available = (p.baseQty || 0) - sold;
        stockMap.set(p.id, available > 0 ? available : 0);
    });

    return stockMap;
}

/**
 * Get available (remaining) stock for a specific variant
 */
export async function getVariantAvailableQuantity(variantId: number): Promise<number> {
    const variant = await prisma.productvariant.findUnique({
        where: { id: variantId },
        select: { stock: true, isActive: true },
    });

    if (!variant || !variant.isActive) return 0;

    const ordered = await prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
            variantId,
            order: {
                status: { in: ["paid", "completed", "success", "succeeded"] },
            },
        },
    });

    const orderedQty = ordered._sum.quantity ?? 0;
    const available = variant.stock - orderedQty;

    return available > 0 ? available : 0;
}

/**
 * Get available (remaining) stock for a product using products.baseQty
 */
export async function getProductAvailableQuantity(productId: number): Promise<number> {
    const product = await prisma.products.findUnique({
        where: { id: productId },
        select: { baseQty: true, active: true },
    });

    if (!product || product.baseQty == null || product.active === false) {
        return 0;
    }

    const ordered = await prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: {
            productId,
            order: {
                status: { in: ["paid", "completed", "success", "succeeded"] },
            },
        },
    });

    const orderedQty = ordered._sum.quantity ?? 0;
    const available = product.baseQty - orderedQty;

    return available > 0 ? available : 0;
}

export async function getAvailableQuantity(params: {
    variantId?: number;
    productId?: number;
}): Promise<number> {
    const { variantId, productId } = params;
    if (variantId) return getVariantAvailableQuantity(variantId);
    if (productId) return getProductAvailableQuantity(productId);
    throw new Error("Please provide variantId or productId");
}
