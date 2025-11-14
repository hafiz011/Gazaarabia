export const charityService = {
    async createDonation(data: any) {
        const res = await fetch("/api/front-end/charity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async updateDonationAfterPayment(id: number, data: any) {
        const res = await fetch(`/api/front-end/charity/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};
