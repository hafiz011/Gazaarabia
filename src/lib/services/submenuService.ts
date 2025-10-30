export const submenuService = {
  getAll: async (token: string) => {
    const res = await fetch("/api/submenus", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch submenus");
    return res.json();
  },

  create: async (token: string, data: any) => {
    const res = await fetch("/api/submenus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create submenu");
    return res.json();
  },

  getById: async (token: string, id: number) => {
    const res = await fetch(`/api/submenus/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch submenu");
    return res.json();
  },

  update: async (token: string, id: number, data: any) => {
    const res = await fetch(`/api/submenus/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update submenu");
    return res.json();
  },

  remove: async (token: string, id: number) => {
    const res = await fetch(`/api/submenus/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete menu");
    return res.json();
  }


};
