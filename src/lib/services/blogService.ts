import { apiFetch } from "../api";
import { Blog } from "../types";

export const blogService = {
  // ✅ Get all blogs
  getAll: (): Promise<Blog[]> => apiFetch("/api/blogs"),

  // ✅ Get blog by ID
  getById: (id: number): Promise<Blog> => apiFetch(`/api/blogs/${id}`),

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
