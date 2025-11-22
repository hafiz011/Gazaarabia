// src/lib/services/stripeService.ts

export const stripeService = {
    async createCustomer(token: string) {
        const res = await fetch("/api/stripe/create-customer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // send token in header
            },
        });

        return res.json();
    },

    async getSavedMethods(token: any) {
        const res = await fetch("/api/stripe/saved-methods", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // send token in header
            }

        });

        return res.json();
    },

    async createPaymentIntent(token: any, amount: number) {
        const res = await fetch("/api/stripe/create-payment-intent", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // send token in header
            },

            body: JSON.stringify({ amount }),
        });

        return res.json();
    },

    async payWithSavedCard(token: string, paymentMethodId: string, amount: number) {
        const res = await fetch("/api/stripe/pay-with-saved-card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,  // send token in header
            },
            body: JSON.stringify({
                paymentMethodId,
                amount,
            }),
        });

        return res.json();
    },
};
