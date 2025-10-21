import { apiFetch } from "../api";

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  createdAt: string;
  category?: {
    id: number;
    name: string;
  };
}

export const subcategoryService = {
 getAll: async (search?: string) => {
    const url = search
      ? `/api/subcategories?search=${encodeURIComponent(search)}`
      : `/api/subcategories`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch subcategories");
    return res.json();
  },

  getById: (id: number): Promise<Subcategory> =>
    apiFetch(`/api/subcategories/${id}`),

  create: (data: Partial<Subcategory>): Promise<Subcategory> =>
    apiFetch("/api/subcategories", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Subcategory>): Promise<Subcategory> =>
    apiFetch(`/api/subcategories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/subcategories/${id}`, {
      method: "DELETE",
    }),
};
