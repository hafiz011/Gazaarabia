export const homePageFrontend = {
    get: async () => {
        const res = await fetch("/api/front-end/homepage/", { cache: "no-store" });

        if (!res.ok) throw new Error("Failed to load homepage");

        return res.json();
    },
};
