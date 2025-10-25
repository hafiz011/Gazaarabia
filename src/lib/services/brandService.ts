export const brandService = {
  getAll: async (token: string, search?: string) => {
    let url = "/api/brands";
    if (search) url += `?search=${encodeURIComponent(search)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json();
  },

  getById: async (token: string, id: number) => {
    const res = await fetch(`/api/brands/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch brand");
    return res.json();
  },

  create: async (token: string, data: { name: string; logo?: string; isTrending?: boolean }) => {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create brand");
    return res.json();
  },

  update: async (
    token: string,
    id: number,
    data: { name: string; logo?: string; isTrending?: boolean }
  ) => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update brand");
    return res.json();
  },

  remove: async (token: string, id: number) => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete brand");
    return res.json();
  },
};
