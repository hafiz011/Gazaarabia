import { apiFetch } from "../api";
import { Blog } from "../types";

export const blogService = {
  // Get all blogs (with optional filters)
  getAll: (token: string, params?: { categoryId?: number | string; search?: string }): Promise<Blog[]> => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append("categoryId", String(params.categoryId));
    if (params?.search) query.append("search", params.search);
    return apiFetch(`/api/blogs${query.toString() ? `?${query.toString()}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Get blog by ID
  getById: (token: string, id: number): Promise<Blog> =>
    apiFetch(`/api/blogs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Get blog by slug (public — no token)
  getBySlug: (slug: string): Promise<Blog> => apiFetch(`/api/blogs/0?slug=${slug}`),

  //  Create new blog
  create: (token: string, data: Partial<Blog>): Promise<Blog> =>
    apiFetch("/api/blogs", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // Update blog
  update: (token: string, id: number, data: Partial<Blog>): Promise<Blog> =>
    apiFetch(`/api/blogs/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  //  Delete blog
  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(`/api/blogs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
