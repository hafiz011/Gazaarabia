export const orderService = {
  /**
   * Get all orders for the logged-in user
   */
  getAll: async (token: string) => {
    const res = await fetch(`/api/front-end/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Failed to fetch orders (${res.status})`);
    return res.json();
  },

  /**
   * Get order details by ID
   */
  getById: async (token: any, id: number) => {
    const res = await fetch(`/api/front-end/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch order");
    const json = await res.json();
    return json.data;
  },

  /**
   * Create a new order
   */
  create: async (
    token: any,
    data: {
      totalAmount: number;
      paymentMethod: string;
      paymentStatus?: string;
      orderItems: {
        productId: number;
        quantity: number;
        price: number;
      }[];
    }
  ) => {
    const res = await fetch(`/api/front-end/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create order: ${errorText}`);
    }

    return res.json();
  },


};
