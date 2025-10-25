import { apiFetch } from "../api";

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const blogCategoryService = {
  // Get all categories
  getAll: (token: string): Promise<BlogCategory[]> =>
    apiFetch("/api/blog-categories", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Get single category by ID
  getById: (token: string, id: number): Promise<BlogCategory> =>
    apiFetch(`/api/blog-categories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Create new category
  create: (token: string, data: Partial<BlogCategory>): Promise<BlogCategory> =>
    apiFetch("/api/blog-categories", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Update category
  update: (token: string, id: number, data: Partial<BlogCategory>): Promise<BlogCategory> =>
    apiFetch(`/api/blog-categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  // Delete category
  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(`/api/blog-categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
};
