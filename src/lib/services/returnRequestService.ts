export const returnRequestAdminService = {
    getAll: async (token: string) => {
        try {
            const res = await fetch(`/api/return-requests`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return await res.json();
        } catch (error) {
            console.error("returnRequestAdminService.getAll error:", error);
            return { success: false, data: [] };
        }
    },
    getById: async (token: string, id: number) => {
        const res = await fetch(`/api/return-requests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.json();
    },

    updateStatus: async (token: string, id: number, data: any) => {
        const res = await fetch(`/api/return-requests/${id}`, {
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
