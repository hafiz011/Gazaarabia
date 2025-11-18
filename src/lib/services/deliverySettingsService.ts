export const deliverySettingsService = {
    async get(token: any) {
        const res = await fetch("/api/delivery-settings", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    async update(token: string, data: any) {
        const res = await fetch("/api/delivery-settings", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};
