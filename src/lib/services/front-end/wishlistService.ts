export const wishlistService = {
  // 🧾 Get all wishlist items of the current user
  getAll: async (token: string) => {
    const res = await fetch("/api/front-end/wishlist", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // ❤️ Add a product to wishlist
  add: async (token: string, productId: number) => {
    const res = await fetch("/api/front-end/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ productId }),
    });

    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // ❌ Remove a product from wishlist
  remove: async (token: string, productId: number) => {
    const res = await fetch(`/api/front-end/wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};
