import { Blog } from "@/lib/types";
import { apiFetch } from "../../api";

export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
}

export const blogsService = {
    // Get all categories
    getAllCategory: (): Promise<BlogCategory[]> =>
        apiFetch("/api/front-end/blog-categories"),



    getAllBlogs: (params?: { categoryId?: number | string; search?: string }): Promise<Blog[]> => {
        const query = new URLSearchParams();
        if (params?.categoryId) query.append("categoryId", String(params.categoryId));
        if (params?.search) query.append("search", params.search);
        return apiFetch(`/api/front-end/blogs${query.toString() ? `?${query.toString()}` : ""}`);
    },


};
