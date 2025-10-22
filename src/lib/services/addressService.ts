export const addressService = {
  // 📬 Get all addresses of the current user
  getAll: async () => {
    const res = await fetch("/api/front-end/addresses", {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // ➕ Add a new address
  create: async (data: any) => {
    const res = await fetch("/api/front-end/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // ✏️ Update an address
  update: async (id: number, data: any) => {
    const res = await fetch(`/api/front-end/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // ❌ Delete an address
  remove: async (id: number) => {
    const res = await fetch(`/api/front-end/addresses/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};
