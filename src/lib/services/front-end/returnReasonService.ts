export const returnReasonService = {
    getAllReasons: async (token?: string) => {
        try {
            const res = await fetch(`/api/front-end/return-reasons`, {
                method: "GET",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`, // only send token if logged in
                },
            });
            if (!res.ok) throw new Error("Failed to fetch return reasons");

            return await res.json(); // { success: true, data: [...] }
        } catch (error) {
            console.error("getReturnReasons error:", error);
            return { success: false, data: [] };
        }
    },
};