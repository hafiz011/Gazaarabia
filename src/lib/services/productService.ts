export const productService = {
  async getAll(token: string, search?: any) {
    const url = search
      ? `/api/products?search=${encodeURIComponent(search)}`
      : `/api/products`;

    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch products");
    return await res.json();
  },

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

    if (!res.ok) throw new Error("Failed to create product");
    return await res.json();
  },

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
