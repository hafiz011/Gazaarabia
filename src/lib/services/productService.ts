export const productService = {
  async getAll(search?: string) {
    try {
      const url = search ? `/api/products?search=${encodeURIComponent(search)}` : `/api/products`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) throw new Error("Failed to fetch products");
      return await res.json();
    } catch (err) {
      console.error("❌ getAll Products Error:", err);
      throw err;
    }
  },

  async getById(id: number) {
    try {
      const res = await fetch(`/api/products/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch product");
      return await res.json();
    } catch (err) {
      console.error("❌ getById Product Error:", err);
      throw err;
    }
  },

  async create(data: any) {
    try {
      const res = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to create product");
      return await res.json();
    } catch (err) {
      console.error("❌ create Product Error:", err);
      throw err;
    }
  },

  async update(id: number, data: any) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update product");
      return await res.json();
    } catch (err) {
      console.error("❌ update Product Error:", err);
      throw err;
    }
  },

  async remove(id: number) {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete product");
      return await res.json();
    } catch (err) {
      console.error("❌ delete Product Error:", err);
      throw err;
    }
  },
};
