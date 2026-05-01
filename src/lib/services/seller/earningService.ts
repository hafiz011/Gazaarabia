import { apiFetch } from "../../api";

export const earningService = {
    getEarnings: (token: string): Promise<any> =>
        apiFetch("/api/seller/earnings", {}, token),
};
