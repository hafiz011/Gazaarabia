export const productService = {
  // async getAll(token: string, search?: string, page: number = 1, pageSize: number = 20) {
  async getAll(token: string, search?: string) {
    try {
      // let url = `/api/products?page=${page}&pageSize=${pageSize}`;
      let url = `/api/products`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
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

    const result = await res.json(); // 🆕 Parse the response body
    console.log('result')

    if (!res.ok) {
      // 🧠 Use the API's error message if available
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

    if (!res.ok) throw new Error("Failed to update product");
    return await res.json();
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
