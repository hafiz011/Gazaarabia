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

  getById: async (
    token: string | null,
    id: number,
    guestUserId?: string | null
  ) => {
    let url = `/api/front-end/orders/${id}`;
    const headers: Record<string, string> = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Guest user → use guest ID
      if (!guestUserId) throw new Error("Missing guest user ID for guest order");
      url += `?userId=${guestUserId}`;
    }

    const res = await fetch(url, { headers, cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch order: ${res.status}`);
    return await res.json();
  },



  /**
   * Create a new order
   */
  create: async (
    token: any,
    data: {
      payment: {
        totalAmount: number;
        itemsTotal: number;
        subtotal: number;
        paymentMethod: string;
        paymentStatus?: string;
        transactionId?: string;
        paymentResponse?: any;
      };
      address: {
        id?: number;
        firstName: string;
        lastName?: string;
        company?: string;
        address1: string;
        address2?: string;
        city: string;
        country: string;
        postalCode: string;
        phone: string;
      };
      orderItems: {
        productId: number;
        variantId: number;
        colorId?: number;
        sizeId?: number;
        quantity: number;
        price: number;
        subtotal: number;
      }[];
    }
  ) => {
    const res = await fetch(`/api/front-end/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data), // ✅ send full structured object
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create order: ${errorText}`);
    }

    return res.json();
  },





  // =====================>guest checkout ================
  guestCheckout: async (data: any) => {
    const res = await fetch(`/api/front-end/guest-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed guest checkout: ${errorText}`);
    }

    return res.json();
  },



};
