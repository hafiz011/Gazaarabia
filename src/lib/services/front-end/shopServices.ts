// export const shopService = {
//   async getShopData(token: any, slug: string, page = 1, limit = 12) {
//     console.log('token:>',token)
//     const res = await fetch(
//       `/api/front-end/shop/${encodeURIComponent(slug)}?page=${page}&limit=${limit}`,
//       {
//         method: "GET",
//         cache: "no-store",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token && { Authorization: `Bearer ${token}` }), // only send token if present
//         },
//       }
//     );

//     if (!res.ok) {
//       const errorData = await res.json().catch(() => ({}));
//       throw new Error(errorData.message || "Failed to fetch shop data");
//     }

//     return res.json();
//   },
// };


export const shopService = {
  async getShopData(
    token: any,
    slug: string,
    page = 1,
    limit = 12,
    filters: any = {}
  ) {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });


    // SORT 
    if (filters.sort) {
      params.append("sort", filters.sort);
    }

    if (filters.priceMin !== undefined)
      params.append("priceMin", filters.priceMin);
    if (filters.priceMax !== undefined)
      params.append("priceMax", filters.priceMax);

    filters.availability?.forEach((v: string) =>
      params.append("availability[]", v)
    );
    filters.sizes?.forEach((id: number) =>
      params.append("sizes[]", String(id))
    );
    filters.colors?.forEach((id: number) =>
      params.append("colors[]", String(id))
    );
    filters.subcategories?.forEach((id: number) =>
      params.append("subcategories[]", String(id))
    );

    const res = await fetch(
      `/api/front-end/shop/${encodeURIComponent(slug)}?${params.toString()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
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
