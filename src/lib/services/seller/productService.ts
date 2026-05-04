export const productService = {
  // async getAll(token: string, search?: string, page: number = 1, pageSize: number = 20) {
  async getAll(token: string, filters: { search?: string; status?: string; categoryId?: string; brandId?: string; page?: number; limit?: number } = {}) {
    try {
      let url = `/api/seller/products?`;
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.categoryId) params.append("categoryId", filters.categoryId);
      if (filters.brandId) params.append("brandId", filters.brandId);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));

      url += params.toString();

      const res = await fetch(url, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  async bulkUpdateStatus(token: string, ids: number[], active: boolean) {
    const res = await fetch(`/api/seller/products`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids, active }),
    });

    if (!res.ok) throw new Error("Failed to bulk update products");
    return await res.json();
  },

  async getById(token: string, id: number) {
    const res = await fetch(`/api/seller/products/${id}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return await res.json();
  },

  async create(token: string, data: any) {
    const res = await fetch(`/api/seller/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json(); //  Parse the response body
    console.log('result')

    if (!res.ok) {
      //  Use the API's error message if available
      const errorMessage =
        result?.message || result?.error || "Failed to create product";
      throw new Error(errorMessage);
    }

    return result;
  }
  ,

  async update(token: string, id: number, data: any) {
    const res = await fetch(`/api/seller/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update product");
    return await res.json();
  },

  async remove(token: string, id: number) {
    const res = await fetch(`/api/seller/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete product");
    return await res.json();
  },
};
