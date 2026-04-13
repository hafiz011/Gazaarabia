export const platformCommissionService = {
  async get(token: string) {
    const res = await fetch("/api/platform-commission", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return await res.json();
  },

  async update(token: string, data: any) {
    const res = await fetch("/api/platform-commission", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  },
};
