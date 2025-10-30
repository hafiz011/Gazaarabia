export const menuService = {
  getAll: async (token:any) => {
    const res = await fetch("/api/menus", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch menus");
    return res.json();
  },

create: async (
  token: string,
  data: { name: string; slug: string; type: string; images?: string[] }
) => {
  if (data.images && data.images.length > 2)
    throw new Error("Maximum 2 images allowed");

  const res = await fetch("/api/menus", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  // 🔹 If API returned an error (non-2xx), show its message
  if (!res.ok) {
    const message =
      result?.message || result?.error || "Failed to create menu";
    throw new Error(message);
  }

  return result;
},


 getById: async (token: string, id: number) => {
    const res = await fetch(`/api/menus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch menu");
    return res.json();
  },

  update: async (token: string, id: number, data: any) => {
    const res = await fetch(`/api/menus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update menu");
    return res.json();
  },

  remove: async (token: string, id: number) => {
    const res = await fetch(`/api/menus/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete menu");
    return res.json();
  }

};
