import { apiFetch } from "../api";

export interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  description?: string | null;
  commission?: number | null;
  submenuId?: number | null;
  position?: number;
  createdAt: string;
  submenu?: {
    id: number;
    name: string;
    menuId: number;
    menu?: {
      name: string;
    };
  };
}

export const categoryService = {
  getAll: (token: string, submenuId?: number): Promise<Category[]> =>
    apiFetch(
      `/api/categories${submenuId ? `?submenuId=${submenuId}` : ""}`,
      {},
      token
    ),

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

  reorder: (
    token: string,
    data: { submenuId: number; items: { id: number; position: number }[] }
  ): Promise<Category[]> =>
    apiFetch(
      "/api/categories/reorder",
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
