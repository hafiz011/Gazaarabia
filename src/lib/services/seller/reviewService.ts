import { apiFetch } from "../../api";

export const reviewService = {
    getReviews: (token: string): Promise<any> =>
        apiFetch("/api/seller/reviews", {}, token),
    togglePin: (id: number, isPinned: boolean, token: string): Promise<any> =>
        apiFetch(`/api/seller/reviews/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ isPinned })
        }, token),
};
