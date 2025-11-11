export const returnRequestService = {
    submit: async (
        token: string,
        data: {
            orderId: number;
            orderItemId: number;
            reasonId: number;
            note?: string;
            images?: string[];
        }
    ) => {
        try {
            const res = await fetch(`/api/front-end/return-requests`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const result = await res.json();
            return result;
        } catch (error) {
            console.error("submit return request error:", error);
            return { success: false, message: "Something went wrong." };
        }
    },
};
