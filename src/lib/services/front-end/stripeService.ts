// src/lib/services/stripeService.ts

export const stripeService = {
    async createCustomer(userId: number) {
        const res = await fetch("/api/stripe/create-customer", {
            method: "POST",
            body: JSON.stringify({ userId }),
        });

        return res.json();
    },

    async getSavedMethods(customerId: string) {
        const res = await fetch("/api/stripe/saved-methods", {
            method: "POST",
            body: JSON.stringify({ customerId }),
        });

        return res.json();
    },

    async createPaymentIntent(customerId: string, amount: number) {
        const res = await fetch("/api/stripe/create-payment-intent", {
            method: "POST",
            body: JSON.stringify({ customerId, amount }),
        });

        return res.json();
    },

    async payWithSavedCard(customerId: string, paymentMethodId: string, amount: number) {
        const res = await fetch("/api/stripe/pay-with-saved", {
            method: "POST",
            body: JSON.stringify({
                customerId,
                paymentMethodId,
                amount,
            }),
        });

        return res.json();
    },
};
