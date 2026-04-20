import { apiFetch } from "../api";

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  description?: string | null;
  commission?: number | null;
  createdAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export const subcategoryService = {
  getAll: (token: string, search?: string) => {
    const url = search
      ? `/api/subcategories?search=${encodeURIComponent(search)}`
      : `/api/subcategories`;
    return apiFetch(url, {}, token);
  },

  getById: (token: string, id: number): Promise<Subcategory> =>
    apiFetch(`/api/subcategories/${id}`, {}, token),

  create: (token: string, data: Partial<Subcategory>): Promise<Subcategory> =>
    apiFetch(
      "/api/subcategories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (token: string, id: number, data: Partial<Subcategory>): Promise<Subcategory> =>
    apiFetch(
      `/api/subcategories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(
      `/api/subcategories/${id}`,
      {
        method: "DELETE",
      },
      token
    ),

  getByCategory: (token: string, categoryId: number) =>
    apiFetch(`/api/subcategories/by-category/${categoryId}`, {}, token),


};
