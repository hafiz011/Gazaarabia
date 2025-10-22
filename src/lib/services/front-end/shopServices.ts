export const shopService = {
  async getShopData(slug: string, page = 1, limit = 12) {
    const res = await fetch(
      `/api/shop/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error("Failed to fetch shop data");
    return res.json();
  },
};
