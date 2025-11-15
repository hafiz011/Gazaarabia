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
};
