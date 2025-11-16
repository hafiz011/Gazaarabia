export const ambassadorService = {
    getAll: async (token: string) => {
        const res = await fetch("/api/ambassadors", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Failed to fetch ambassadors");
        return res.json();
    },

    async getEarnings(
        token: string,
        filters: { month?: string; status?: string; search?: string } = {}
    ) {
        const query = new URLSearchParams();

        if (filters.month && filters.month !== "all") query.append("month", filters.month);
        if (filters.status && filters.status !== "all") query.append("status", filters.status);
        if (filters.search && filters.search.trim() !== "")
            query.append("search", filters.search);

        const res = await fetch(`/api/affiliates/ambassador/earnings?${query.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Failed to fetch ambassador earnings");

        return {
            invoices: data.data.invoices,
            summary: data.data.summary,
        };
    },

};
