// services/localCartService.ts

const LOCAL_CART_KEY = "gazaarbia_guest_cart";

export const localCartService = {
  get() {
    if (typeof window === "undefined") return [];
    const data = localStorage.getItem(LOCAL_CART_KEY);
    return data ? JSON.parse(data) : [];
  },

  add(item: {
    productId: number;
    quantity: number;
    variantId?: number;
    colorId?: number;
    sizeId?: number;
  }) {
    if (typeof window === "undefined") return;
    const cart = this.get();

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
    } else {
      cart.push(item);
    }

    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  },

  remove(productId: number, variantId?: number) {
    if (typeof window === "undefined") return;
    const cart = this.get().filter(
      (p: any) => !(p.productId === productId && p.variantId === variantId)
    );
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  },

  updateQuantity(productId: number, variantId: number, quantity: number) {
    if (typeof window === "undefined") return;
    const cart = this.get();
    const item = cart.find(
      (p: any) => p.productId === productId && p.variantId === variantId
    );
    if (item) item.quantity = quantity;
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
  },

  clear() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCAL_CART_KEY);
  },
};
