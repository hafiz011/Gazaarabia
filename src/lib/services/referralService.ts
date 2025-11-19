export const referralService = {
    async resolveReferral(code: string) {
        try {
            const res = await fetch(`/api/affiliates/resolve?ref=${code}`, {
                method: "GET",
                cache: "no-store",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to resolve referral");

            return data;
        } catch (err: any) {
            throw new Error(err.message || "Referral lookup failed");
        }
    },
};
