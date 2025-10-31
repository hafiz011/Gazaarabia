// /src/services/localCartService.ts
const LOCAL_CART_KEY = "guest_cart";

export const localCartService = {
  get() {
    if (typeof window === "undefined") return { cart: [], subtotal: 0 };
    const data = localStorage.getItem(LOCAL_CART_KEY);
    return data ? JSON.parse(data) : { cart: [], subtotal: 0 };
  },

  save(cart: any[]) {
    const subtotal = cart.reduce(
      (acc, item) => acc + (item.selectedVariantData?.price || 0) * item.quantity,
      0
    );
    const formatted = { cart, subtotal };
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(formatted));
  },

  add(item:any) {
    if (typeof window === "undefined") return;

    const { cart } = this.get();

    // Check if item already exists
    const existing = cart.find(
      (p: any) =>
        p.productId === item.productId &&
        p.variantId === item.variantId &&
        p.colorId === item.colorId &&
        p.sizeId === item.sizeId
    );

    if (existing) {
      existing.quantity += item.quantity;
      existing.updatedAt = new Date().toISOString();
    } else {
      // Keep structure same as API response
      cart.push({
        id: Date.now(), // local unique ID
        userId: null,
        productId: item.productId,
        colorId: item.colorId,
        sizeId: item.sizeId,
        variantId: item.variantId,
        quantity: item.quantity,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        product: {
          id: item.product.id,
          title: item.product.title,
          slug: item.product.slug,
          sellingPrice: item.product.sellingPrice,
          productimage: item.product.productimage || [],
        },
        selectedVariantData: {
          id: item.selectedVariantData.id,
          sizeId: item.selectedVariantData.sizeId,
          colorId: item.selectedVariantData.colorId,
          sizeName: item.selectedVariantData.sizeName,
          colorName: item.selectedVariantData.colorName,
          hexCode: item.selectedVariantData.hexCode,
          price: item.selectedVariantData.price,
          variantImages: item.selectedVariantData.variantImages || [],
        },
      });
    }

    this.save(cart);
  },

  remove(productId: number, variantId: number) {
    const { cart } = this.get();
    const filtered = cart.filter(
      (p: any) => !(p.productId === productId && p.variantId === variantId)
    );
    this.save(filtered);
  },

  updateQuantity(productId: number, variantId: number, quantity: number) {
    const { cart } = this.get();
    const item = cart.find(
      (p: any) => p.productId === productId && p.variantId === variantId
    );
    if (item) {
      item.quantity = quantity;
      item.updatedAt = new Date().toISOString();
    }
    this.save(cart);
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCAL_CART_KEY);
  },
};
