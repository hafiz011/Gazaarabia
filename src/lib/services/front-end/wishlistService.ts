export const wishlistService = {
  getAll: async (token: string, page = 1, limit = 6) => {
    const res = await fetch(`/api/front-end/wishlist?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

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
