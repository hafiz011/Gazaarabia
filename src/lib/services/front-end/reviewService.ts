export const reviewService = {
  getAll: async (token: string, productId?: number) => {
    let url = "/api/front-end/reviews";
    if (productId) url += `?productId=${productId}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch reviews");
    return res.json();
  },

  getById: async (token: string, id: number) => {
    const res = await fetch(`/api/front-end/reviews/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch review");
    return res.json();
  },

create: async (
  token: string,
  data: {orderItemId:number, productId: number; rating: number; comment?: string; variantId?: number }
) => {
  const res = await fetch("/api/front-end/reviews", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const responseData = await res.json();

  //  If API returned an error, throw it with the actual message
  if (!res.ok) {
    throw new Error(responseData?.message || "Failed to create review");
  }

  //  Return success response with message or data
  return responseData;
},


  remove: async (token: string, id: number) => {
    const res = await fetch(`/api/front-end/reviews/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete review");
    return res.json();
  },
};
