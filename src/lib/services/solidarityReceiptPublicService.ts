import { apiFetch } from "../api";

export const solidarityReceiptPublicService = {
    getAll: () =>
        apiFetch("/api/front-end/solidarity-receipts", { method: "GET" }),
};
