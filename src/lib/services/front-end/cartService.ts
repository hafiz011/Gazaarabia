import { localCartService } from "./localCartService";

export const cartService = {
  async getAll(token?: any) {
    if (!token) {
      // Guest mode
      // return { items: localCartService.get() };
      const result = await localCartService.get();
      return result;
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
      const result = localCartService.add({
        productId,
        quantity,
        variantId: variantId!, //  non-null assertion
        colorId: colorId!,
        sizeId: sizeId!,
        product,
        selectedVariantData,
      });
      if (result?.success === false) throw new Error(result.error);
      return result;
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
      // parse json
      const data = await res.json().catch(() => ({}));
      const msg = data?.error || data?.message || "Failed to add to cart.";
      throw new Error(msg);
    }

    return res.json();
  },

  async remove(token: any, productId: number, variantId: number) {
    if (!token) {
      const result = localCartService.remove(productId, variantId);
      if (!result?.success) throw new Error(result?.message || "Failed to remove item");
      return result
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
    token: any,
    productId: number,
    variantId: number,
    quantity: number
  ) {
    if (!token) {
      const result = localCartService.updateQuantity(productId, variantId, quantity);
      if (result?.success === false) {
        throw new Error(result.error);
      }
      return result;
    }


    const res = await fetch("/api/front-end/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, variantId, quantity }),
    });

    if (!res.ok) {
      // parse json
      const data = await res.json().catch(() => ({}));
      const msg = data?.error || data?.message || "Failed to update quantity";
      throw new Error(msg);
    }


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


  /**
 * Validate cart stock before proceeding to checkout
 */
  async validateStock(token?: any) {
    try {
      if (token) {
        //  Logged-in user — validate via server cart (token-based)
        const res = await fetch("/api/front-end/cart/validate-stock", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            message: data?.message || "Stock validation failed.",
            unavailableItems: data?.unavailableItems || [],
          };
        }

        return res.json(); // { success: boolean, unavailableItems?: [] }
      } else {
        // Guest user — validate local cart against live stock
        const localData = localCartService.get();
        const cartItems = localData?.cart || [];

        if (!cartItems.length) {
          return { success: false, message: "Your cart is empty." };
        }

        // // Prepare clean cart payload for API
        // const formattedItems = cartItems.map((item: any) => ({
        //   productId: item.productId,
        //   variantId: item.variantId,
        //   quantity: item.quantity,
        //   productName: item.product?.title || "Unknown Product",
        // }));

        const res = await fetch("/api/front-end/cart/validate-stock/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems: cartItems }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          return {
            success: false,
            message: data?.message || "Stock validation failed.",
            unavailableItems: data?.unavailableItems || [],
          };
        }

        return res.json(); // expected { success: boolean, unavailableItems?: [] }
      }
    } catch (error) {
      console.error("Error validating cart stock:", error);
      return { success: false, message: "Stock validation failed." };
    }
  },


  // async validateStock(token?: string) {
  //   if (!token) {
  //     // For guest users — optional: skip or validate local cart
  //     return { success: true, message: "Guest validation skipped" };
  //   }

  //   try {
  //     const res = await fetch("/api/front-end/cart/validate-stock", {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       cache: "no-store",
  //     });

  //     return res.json(); // expected { success: boolean, unavailableItems?: [] }
  //   } catch (error) {
  //     console.error("Error validating cart stock:", error);
  //     throw error;
  //   }
  // },


  // async syncCart(token?: any, cartItems?: any[]) {
  //   const endpoint = "/api/front-end/cart/sync";

  //   const options: any = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ cartItems: cartItems || [] }), //  always send body
  //   };

  //   if (token) {
  //     options.headers.Authorization = `Bearer ${token}`;
  //   }

  //   const res = await fetch(endpoint, options);
  //   if (!res.ok) throw new Error("Failed to sync cart");
  //   return res.json();
  // }

  async syncCart(token?: any, cartItems?: any[]) {
  const endpoint = "/api/front-end/cart/sync";

  const options: any = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cartItems: cartItems || [] }),
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Failed to sync cart");
  }

  const data = await res.json();

  // 🧭 Guest user — clear old and save fresh
  if (!token && data?.syncedCart) {
    try {
      console.log("🧹 Clearing old guest cart...");
      localCartService.clear();

      // ✅ Reset and save new synced cart
      localCartService.save(data.syncedCart);

      // ✅ Log confirmation
      const newLocal = localCartService.get();
      console.log("🧩 Local cart synced:", newLocal);
    } catch (error) {
      console.error("❌ Failed to update local cart after sync:", error);
    }
  }

  return data;
}


  // async syncCart(token?: any, cartItems?: any[]) {
  //   const endpoint = "/api/front-end/cart/sync";

  //   const options: any = {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ cartItems: cartItems || [] }), // always send body
  //   };

  //   if (token) {
  //     options.headers.Authorization = `Bearer ${token}`;
  //   }

  //   const res = await fetch(endpoint, options);

  //   if (!res.ok) {
  //     const data = await res.json().catch(() => ({}));
  //     throw new Error(data?.error || "Failed to sync cart");
  //   }

  //   const data = await res.json();

  //   //  Guest user (no token): update local storage with latest synced data
  //   if (!token && data?.syncedCart) {
  //     try {
  //       const updatedCartData = {
  //         cart: data.syncedCart,
  //         subtotal: data.subtotal || 0,
  //       };

  //       // Step 1: clear any old guest cart
  //       localCartService.clear();

  //       // Use existing localCartService.save() to persist properly
  //       localCartService.save(updatedCartData.cart);
  //       console.log('local cart synced:>', localCartService.get())

  //       console.log(" Local cart updated after sync");
  //     } catch (error) {
  //       console.error(" Failed to update local cart after sync:", error);
  //     }
  //   }

  //   return data;
  // }


};
