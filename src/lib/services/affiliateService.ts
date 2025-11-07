export const affiliateService = {
  async getAll(token: string) {
    const res = await fetch("/api/affiliates", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch affiliates");
    return data.data;
  },

  async create(token: string, data: any) {
    const res = await fetch(`/api/affiliates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to create affiliate.");
    return json;
  },

  async getById(token: string, id: number) {
    const res = await fetch(`/api/affiliates/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch affiliate details");
    return data;
  },

  async update(token: string, id: number, data: any) {
    const res = await fetch(`/api/affiliates/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to update affiliate.");
    return json;
  },

  async remove(token: string, id: number) {
    const res = await fetch(`/api/affiliates/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Failed to delete affiliate.");
    return json;
  },

  //  NEW SERVICE (used for earnings page)
async getEarnings(
  token: string,
  filters: { month?: string; status?: string; search?: string } = {}
) {
  const query = new URLSearchParams();

  if (filters.month && filters.month !== "all") query.append("month", filters.month);
  if (filters.status && filters.status !== "all") query.append("status", filters.status);
  if (filters.search && filters.search.trim() !== "") query.append("search", filters.search);

  const res = await fetch(`/api/affiliates/earnings?${query.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch earnings");

  return {
    invoices: data.data.invoices,
    summary: data.data.summary,
  };
},


 async getDashboard(token: string) {
    const res = await fetch(`/api/affiliates/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch dashboard");
    return data;
  },


  async getProfile(token: string) {
  const res = await fetch(`/api/affiliates/profile`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load profile");
  return data.data;
}


};
