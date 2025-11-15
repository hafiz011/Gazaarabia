export const subscriberService = {
    // GET ALL SUBSCRIBERS
    getAll: async (token: string, search?: string) => {
        let url = "/api/subscribers";
        if (search) url += `?search=${encodeURIComponent(search)}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch subscribers");
        return res.json();
    },

    // GET SINGLE SUBSCRIBER BY ID
    getById: async (token: string, id: number) => {
        const res = await fetch(`/api/subscribers/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch subscriber");
        return res.json();
    },

    // UPDATE SUBSCRIBER
    update: async (
        token: string,
        id: number,
        data: { name?: string; phone?: string; isActive?: boolean }
    ) => {
        const res = await fetch(`/api/subscribers/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to update subscriber");
        return res.json();
    },

    // DELETE SUBSCRIBER
    remove: async (token: string, id: number) => {
        const res = await fetch(`/api/subscribers/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to delete subscriber");
        return res.json();
    },
};
