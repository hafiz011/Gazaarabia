export const productFilterOptionsService = {
  async getProductOptions() {
    const res = await fetch("/api/front-end/product-filter-options", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch product options");
    }

    const data = await res.json();
    return data.data;
  },
};
