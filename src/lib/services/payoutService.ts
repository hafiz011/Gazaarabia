export const payoutService = {
  async list(token: any) {
    const res = await fetch(`/api/payouts`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    const data = await res.json();
    return data.data;
  },

  async markPaid(token: any, payload: any) {
    const res = await fetch(`/api/payouts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  },
  async history(token: any) {
    const res = await fetch(`/api/payouts/history`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
    return await res.json();
  }
};
