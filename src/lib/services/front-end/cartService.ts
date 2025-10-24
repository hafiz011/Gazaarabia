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
    return res.json(); // 👈 will now contain subtotal
  },

  async add(token: string, productId: number, quantity = 1) {
    const res = await fetch("/api/front-end/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to add to cart");
    return res.json();
  },

  async remove(token: string, productId: number) {
    const res = await fetch("/api/front-end/cart", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });
    if (!res.ok) throw new Error("Failed to remove from cart");
    return res.json(); // 👈 can include new subtotal
  },

  async updateQuantity(token: string, productId: number, quantity: number) {
    const res = await fetch("/api/front-end/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!res.ok) throw new Error("Failed to update quantity");
    return res.json(); // 👈 can include new subtotal too
  },
};
