export const productService = {


  // async getAll(token: string, search?: string, page: number = 1, pageSize: number = 20) {
  async getProductsFilters(token: string, params?: any) {
    try {
      let url = `/api/products/product-filters`;

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


  // async getAll(token: string, search?: string, page: number = 1, pageSize: number = 20) {
  async getAll(token: string, params?: any) {
    try {
      // let url = `/api/products?page=${page}&pageSize=${pageSize}`;
      let url = `/api/products`;
      if (params) {
        const query = new URLSearchParams();

        if (params.search) query.append("search", params.search);
        if (params.categoryId) query.append("categoryId", params.categoryId);
        if (params.subcategoryId) query.append("subcategoryId", params.subcategoryId);
        if (params.brandIds?.length)
          query.append("brandIds", params.brandIds.join(","));

        if (params.minPrice) query.append("minPrice", params.minPrice);
        if (params.maxPrice) query.append("maxPrice", params.maxPrice);

        if (params.status) query.append("status", params.status);

        if (params.fromDate) query.append("fromDate", params.fromDate);
        if (params.toDate) query.append("toDate", params.toDate);

        if (params.sortBy) query.append("sortBy", params.sortBy);

        url += `?${query.toString()}`;
      }

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
  }
  ,

  async getById(token: string, id: number) {
    const res = await fetch(`/api/products/${id}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return await res.json();
  },

  async create(token: string, data: any) {
    const res = await fetch(`/api/products`, {
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
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const responseData = await res.json();

    if (!res.ok) throw new Error(responseData?.message || "Failed to update product");
    return responseData;
  },

  async remove(token: string, id: number) {
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to delete product");
    return await res.json();
  },
};
