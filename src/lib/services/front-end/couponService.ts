export const frontCouponService = {
  validate: async (token: string | null, code: string, orderTotal: number) => {
    const res = await fetch("/api/front-end/coupons/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ code, orderTotal }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to validate coupon.");
    return data;
  },
};
