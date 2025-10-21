import { apiFetch } from "../api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export const categoryService = {
  getAll: (): Promise<Category[]> => apiFetch("/api/categories"),

  getById: (id: number): Promise<Category> =>
    apiFetch(`/api/categories/${id}`),

  create: (data: Partial<Category>): Promise<Category> =>
    apiFetch("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Category>): Promise<Category> =>
    apiFetch(`/api/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/categories/${id}`, {
      method: "DELETE",
    }),
};
