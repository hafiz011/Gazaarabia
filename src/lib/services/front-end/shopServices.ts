export const shopService = {
  async getShopData(token: any, slug: string, page = 1, limit = 12) {
    console.log('token:>',token)
    const res = await fetch(
      `/api/shop/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }), // ✅ only send token if present
        },
      }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch shop data");
    }

    return res.json();
  },
};
