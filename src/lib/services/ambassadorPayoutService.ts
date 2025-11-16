export const ambassadorPayoutService = {
    async list(token: any) {
        const res = await fetch(`/api/ambassador-invoices`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store"
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to load ambassador invoices");

        return json.data;
    },

    async markPaid(token: any, payload: any) {
        const res = await fetch(`/api/ambassador-invoices`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to mark ambassador invoice paid");

        return json;
    }
};
