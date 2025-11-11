import { apiFetch } from "../api";

export interface ReturnReason {
    id: number;
    label: string;
    requireImage: boolean;
    createdAt: string;
}

export const returnReasonService = {
    getAll: (token: string): Promise<ReturnReason[]> =>
        apiFetch("/api/return-reasons", {}, token),

    getById: (token: string, id: number): Promise<ReturnReason> =>
        apiFetch(`/api/return-reasons/${id}`, {}, token),

    create: (token: string, data: Partial<ReturnReason>): Promise<ReturnReason> =>
        apiFetch(
            "/api/return-reasons",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            token
        ),

    update: (token: string, id: number, data: Partial<ReturnReason>): Promise<ReturnReason> =>
        apiFetch(
            `/api/return-reasons/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            },
            token
        ),

    remove: (token: string, id: number): Promise<{ message: string }> =>
        apiFetch(
            `/api/return-reasons/${id}`,
            { method: "DELETE" },
            token
        ),
};
