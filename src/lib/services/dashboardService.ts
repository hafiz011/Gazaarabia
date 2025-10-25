import { apiFetch } from "../api";

export interface DashboardData {
  blogs: number;
  blogCategories: number;
  brands: number;
  sizes: number;
  colors: number;
  categories: number;
  subcategories: number;
  deliveryOptions: number;
  materialCares: number;
  products: number;
  recentBlogs: { id: number; title: string; createdAt: string }[];
}

export const dashboardService = {
  getDashboard: (token: string): Promise<DashboardData> =>
    apiFetch("/api/dashboard", {}, token),
};
