export const cartService = {
  async getAll(token: string) {
    const res = await fetch("/api/front-end/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to fetch cart items");
    return res.json(); //  will now contain subtotal
  },

  // async add(token: string, productId: number, quantity = 1) {
  //   const res = await fetch("/api/front-end/cart", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //     body: JSON.stringify({ productId, quantity }),
  //   });
  //   if (!res.ok) throw new Error("Failed to add to cart");
  //   return res.json();
  // },


  async add(
    token: string,
    productId: number,
    quantity = 1,
    variantId?: number, // variantId
    colorId?: number,   // optional — if you want to store color
    sizeId?: number     // optional — if you want to store size
  ) {
    const res = await fetch("/api/front-end/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity, variantId, colorId, sizeId }),
    });

    if (!res.ok) {
      // parse json
      const data = await res.json().catch(() => ({}));
      const msg = data?.error || data?.message || "Failed to add to cart.";
      throw new Error(msg);
    }

    return res.json();
  },


  async remove(token: string, productId: number, variantId: number) {
    const res = await fetch("/api/front-end/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, variantId }),
    });
    if (!res.ok) throw new Error("Failed to remove from cart");
    return res.json(); //  can include new subtotal
  },

  async updateQuantity(token: string, productId: number, variantId: number, quantity: number) {
    const res = await fetch("/api/front-end/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, variantId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to update quantity");
    return res.json(); //  can include new subtotal too
  },


  // clear cart after purchase
  clear: async (token: any) => {
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
