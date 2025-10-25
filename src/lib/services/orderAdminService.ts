export const orderAdminService = {
  getAll: async (token: string, search?: string) => {
    let url = `/api/orders`;
    if (search) url += `?search=${encodeURIComponent(search)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },
};
