export const subscriberService = {
    start: async (email: string) => {
        const res = await fetch("/api/front-end/subscribers/start", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) throw new Error("Failed to start subscribe");
        return res.json();
    },

    complete: async (email: string, name: string, phone: string) => {
        const res = await fetch("/api/front-end/subscribers/complete", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, name, phone }),
        });

        if (!res.ok) throw new Error("Failed to complete subscribe");
        return res.json();
    },

    unsubscribe: async (email: string) => {
        const res = await fetch("/api/front-end/subscribers/unsubscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        });

        if (!res.ok) throw new Error("Failed to unsubscribe");
        return res.json();
    },
};
