export const couponService = {
  addCoupon: async (token: any, data: any) => {
    const res = await fetch("/api/coupons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  getAllCoupons: async (token: string) => {
    const res = await fetch("/api/coupons", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  getById: async (token: string, id: number) => {
    const res = await fetch(`/api/coupons/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  updateCoupon: async (token: string, id: number, data: any) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  deleteCoupon: async (token: string, id: number) => {
    const res = await fetch(`/api/coupons/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};
