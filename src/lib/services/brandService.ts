export const brandService = {
  getAll: async (search?: string) => {
    let url = "/api/brands";
      if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
  },

  getById: async (id: number) => {
    const res = await fetch(`/api/brands/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch brand");
    return res.json();
  },

  create: async (data: { name: string; logo?: string; isTrending?: boolean }) => {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create brand");
    return res.json();
  },

  update: async (id: number, data: { name: string; logo?: string; isTrending?: boolean }) => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update brand");
    return res.json();
  },

  remove: async (id: number) => {
    const res = await fetch(`/api/brands/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete brand");
    return res.json();
  },
};
