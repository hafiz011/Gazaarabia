import { apiFetch } from "../../api";

export interface DashboardData {
  deliveryOptions: number;
  products: number;
  orders: number;
}

export const dashboardService = {
  getDashboard: (token: string): Promise<DashboardData> =>
    apiFetch("/api/seller/dashboard", {}, token),
};
