import { apiFetch } from "../api";

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const blogCategoryService = {
  getAll: (): Promise<BlogCategory[]> => apiFetch("/api/blog-categories"),

  getById: (id: number): Promise<BlogCategory> =>
    apiFetch(`/api/blog-categories/${id}`),

  create: (data: Partial<BlogCategory>): Promise<BlogCategory> =>
    apiFetch("/api/blog-categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<BlogCategory>): Promise<BlogCategory> =>
    apiFetch(`/api/blog-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/blog-categories/${id}`, {
      method: "DELETE",
    }),
};
