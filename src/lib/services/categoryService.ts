import { apiFetch } from "../api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  createdAt: string;
}

export const categoryService = {
  getAll: (token: string): Promise<Category[]> =>
    apiFetch("/api/categories", {}, token),

  getById: (token: string, id: number): Promise<Category> =>
    apiFetch(`/api/categories/${id}`, {}, token),

  create: (token: string, data: Partial<Category>): Promise<Category> =>
    apiFetch(
      "/api/categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (token: string, id: number, data: Partial<Category>): Promise<Category> =>
    apiFetch(
      `/api/categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(
      `/api/categories/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};
