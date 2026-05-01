import { apiFetch } from "../../api";

export const profileService = {
    getProfile: (token: string): Promise<any> =>
        apiFetch("/api/seller/profile", {}, token),

    updateProfile: (data: Record<string, any>, token: string): Promise<any> =>
        apiFetch("/api/seller/profile", { method: "PATCH", body: JSON.stringify(data) }, token),
};
