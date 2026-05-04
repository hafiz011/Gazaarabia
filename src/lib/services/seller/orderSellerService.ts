export const orderSellerService = {
    getAll: async (token: string, search?: string, page: number = 1, limit: number = 50) => {
        let url = `/api/seller/orders?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
    },
};
