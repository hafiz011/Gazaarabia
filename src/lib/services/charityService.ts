export const charityService = {
    getAll: async (token: string, search?: string) => {
        let url = "/api/charity";
        if (search) url += `?search=${encodeURIComponent(search)}`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch donations");
        return res.json();
    },

    getById: async (token: string, id: number) => {
        const res = await fetch(`/api/charity/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch donation");
        return res.json();
    }
};
