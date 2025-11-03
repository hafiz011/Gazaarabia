/**
 * Calculate subtotal for localStorage cart
 * - Supports both product and variant prices
 */


const LOCAL_CART_KEY = process.env.LOCAL_CART_KEY || "gaza_arabia_guest_cart";

export function calculateLocalCartSubtotal(): number {
    if (typeof window === "undefined") return 0;

    const cartData = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || "[]");
    if (!Array.isArray(cartData)) return 0;

    const subtotal = cartData.reduce((sum: number, item: any) => {
        const price =
            item.selectedVariantData?.price ??
            item.product?.sellingPrice ??
            0;
        return sum + price * item.quantity;
    }, 0);

    return parseFloat(subtotal.toFixed(2));
}


/**
 * Get enriched localStorage cart data (similar to backend)
 * Adds selectedVariantData + availableStock for each item
 */
export function getLocalCartData() {
    if (typeof window === "undefined") return { cart: [], subtotal: 0 };

    const data = localStorage.getItem(LOCAL_CART_KEY);
    if (!data) return { cart: [], subtotal: 0 };

    const parsed = JSON.parse(data);

    //  Handle both structures:
    // Case 1: { cart: [...], subtotal: 123 }
    // Case 2: [ {...}, {...} ]
    const cart = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.cart)
            ? parsed.cart
            : [];


    // Add computed fields (if missing)
    const enrichedCart = cart.map((item: any) => {
        const selectedVariant = item.selectedVariantData ?? null;

        const selectedVariantData = selectedVariant
            ? {
                id: selectedVariant.id,
                sizeId: selectedVariant.sizeId,
                colorId: selectedVariant.colorId,
                sizeName: selectedVariant.sizeName ?? null,
                colorName: selectedVariant.colorName ?? null,
                hexCode: selectedVariant.hexCode ?? null,
                price: selectedVariant.price ?? item.product.sellingPrice,
                availableStock:
                    selectedVariant.availableStock ?? item.availableStock ?? 0,
                variantImages: selectedVariant.variantImages || [],
            }
            : null;

        return {
            ...item,
            selectedVariantData,
            availableStock:
                selectedVariantData?.availableStock ??
                item.product?.availableStock ??
                0,
        };
    });

    const subtotal = enrichedCart.reduce((sum: number, item: any) => {
        const price =
            item.selectedVariantData?.price ??
            item.product?.sellingPrice ??
            0;
        return sum + price * item.quantity;
    }, 0);

    return {
        cart: enrichedCart,
        subtotal: parseFloat(subtotal.toFixed(2)),
    };
}
