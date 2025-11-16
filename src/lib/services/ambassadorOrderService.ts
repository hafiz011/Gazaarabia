export const ambassadorOrderService = {
    getAll: async (token: string) => {
        const res = await fetch(`/api/affiliates/ambassador/order-items`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to load ambassador order items");

        return res.json();
    },

    getOne: async (token: string, id: number) => {
        const res = await fetch(`/api/affiliates/ambassador/order-items/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        return res.json();
    }
};
