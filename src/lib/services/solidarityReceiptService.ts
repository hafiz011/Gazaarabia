import { apiFetch } from "../api";

export interface SolidarityReceipt {
    id: number;
    title: string;
    description?: string;
    amount: number;
    receiptImage?: string;
    createdAt: string;
}

export const solidarityReceiptService = {
    getAll: (token: string): Promise<any> =>
        apiFetch("/api/solidarity-receipts", {}, token),

    getById: (token: string, id: number): Promise<any> =>    // 
        apiFetch(`/api/solidarity-receipts/${id}`, {}, token),

    create: (token: string, data: Partial<SolidarityReceipt>): Promise<any> =>
        apiFetch(
            "/api/solidarity-receipts",
            {
                method: "POST",
                body: JSON.stringify(data),
            },
            token
        ),

    update: (token: string, id: number, data: Partial<SolidarityReceipt>) =>
        apiFetch(
            `/api/solidarity-receipts/${id}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            },
            token
        ),

    remove: (token: string, id: number) =>
        apiFetch(`/api/solidarity-receipts/${id}`, { method: "DELETE" }, token),
};
