export const returnRequestSellerService = {
    getAll: async (token: string, page: number = 1, limit: number = 10) => {
        try {
            const res = await fetch(`/api/seller/return-requests?page=${page}&limit=${limit}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return await res.json();
        } catch (error) {
            console.error("returnRequestSellerService.getAll error:", error);
            return { success: false, data: [] };
        }
    },
    getById: async (token: string, id: number) => {
        const res = await fetch(`/api/seller/return-requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    updateStatus: async (token: string, id: number, data: any) => {
        const res = await fetch(`/api/seller/return-requests/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};
