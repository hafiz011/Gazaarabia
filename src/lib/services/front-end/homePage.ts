export const homePageFrontend = {
    get: async () => {
        const res = await fetch("/api/front-end/homepage", {
            next: { revalidate: 300 } // Revalidate every 5 minutes (Phase 7)
        });

        if (!res.ok) throw new Error("Failed to load homepage");

        return res.json();
    },
};
