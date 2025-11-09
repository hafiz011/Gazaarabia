export const homePageService = {
    get: async (token: string) => {
        const res = await fetch("/api/home-page-setting", {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to load homepage settings");
        return res.json();
    },

    update: async (token: string, payload: any) => {
        const res = await fetch("/api/home-page-setting", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to update homepage settings");
        return res.json();
    },
};
