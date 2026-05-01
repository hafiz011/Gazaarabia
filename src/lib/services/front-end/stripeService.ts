// src/lib/services/front-end/stripeService.ts

export const stripeService = {
    async createCustomer(token: string | null) {
        if (!token) {
            return { error: "Authentication required" };
        }
        
        const res = await fetch("/api/stripe/create-customer", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        return res.json();
    },

    async getSavedMethods(token: string | null) {
        if (!token) {
            return { paymentMethods: [], error: null };
        }
        
        const res = await fetch("/api/stripe/saved-methods", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        });

        return res.json();
    },

    async createPaymentIntent(token: string | null, amount: number) {
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }
        
        const res = await fetch("/api/stripe/create-payment-intent", {
            method: "POST",
            headers,
            body: JSON.stringify({ amount }),
        });

        return res.json();
    },

    async payWithSavedCard(token: string | null, paymentMethodId: string, amount: number) {
        if (!token) {
            return { error: "Authentication required" };
        }
        
        const res = await fetch("/api/stripe/pay-with-saved-card", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                paymentMethodId,
                amount,
            }),
        });

        return res.json();
    },
};
