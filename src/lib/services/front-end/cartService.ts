import { localCartService } from "./localCartService";

export const cartService = {
  async getAll(token?: string) {
    if (!token) {
      // Guest mode
      return { items: localCartService.get() };
    }

    const res = await fetch("/api/front-end/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch cart items");
    return res.json();
  },

  async add(
    token: string | undefined,
    productId: number,
    quantity = 1,
    variantId?: number,
    colorId?: number,
    sizeId?: number,
    product?: any,
    selectedVariantData?: any
  ) {
    if (!token) {
      localCartService.add({
        productId,
        quantity,
        variantId: variantId!, //  non-null assertion
        colorId: colorId!,
        sizeId: sizeId!,
        product,
        selectedVariantData,
      });
      return { success: true, local: true };
    }


    // Logged-in user → API call
    const res = await fetch("/api/front-end/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity, variantId, colorId, sizeId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to add to cart: ${errorText}`);
    }

    return res.json();
  },

  async remove(token: string | undefined, productId: number, variantId: number) {
    if (!token) {
      localCartService.remove(productId, variantId);
      return { success: true, local: true };
    }

    const res = await fetch("/api/front-end/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, variantId }),
    });
    if (!res.ok) throw new Error("Failed to remove from cart");
    return res.json();
  },

  async updateQuantity(
    token: string | undefined,
    productId: number,
    variantId: number,
    quantity: number
  ) {
    if (!token) {
      localCartService.updateQuantity(productId, variantId, quantity);
      return { success: true, local: true };
    }

    const res = await fetch("/api/front-end/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to update quantity");
    return res.json();
  },

  async clear(token?: string) {
    if (!token) {
      localCartService.clear();
      return { success: true, local: true };
    }

    const res = await fetch(`/api/front-end/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to clear cart: ${errorText}`);
    }

    return res.json();
  },
};
