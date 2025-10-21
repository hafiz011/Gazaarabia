import { apiFetch } from "../api";
import { Blog } from "../types";

export const blogService = {
  // ✅ Get all blogs
  // getAll: (): Promise<Blog[]> => apiFetch("/api/blogs"),

  getAll: (params?: { categoryId?: number | string; search?: string }): Promise<Blog[]> => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append("categoryId", String(params.categoryId));
    if (params?.search) query.append("search", params.search);
    return apiFetch(`/api/blogs${query.toString() ? `?${query.toString()}` : ""}`);
  },

  // ✅ Get blog by ID
  getById: (id: number): Promise<Blog> => apiFetch(`/api/blogs/${id}`),

   // ✅ Get blog by slug (public use)
  getBySlug: (slug: string): Promise<Blog> => apiFetch(`/api/blogs/0?slug=${slug}`),

  // ✅ Create new blog
  create: (data: Partial<Blog>): Promise<Blog> =>
    apiFetch("/api/blogs", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ✅ Update blog
  update: (id: number, data: Partial<Blog>): Promise<Blog> =>
    apiFetch(`/api/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ✅ Delete blog
  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/blogs/${id}`, {
      method: "DELETE",
    }),
};
