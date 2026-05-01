import { apiFetch } from "../../api";

export const customerService = {
    getCustomers: (token: string): Promise<any> =>
        apiFetch("/api/seller/customers", {}, token),
};
