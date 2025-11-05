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
};
