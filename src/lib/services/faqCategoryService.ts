import { apiFetch } from "../api";

export interface FaqCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export const faqCategoryService = {
  // ✅ Get all FAQ categories
  getAll: (token: string): Promise<FaqCategory[]> =>
    apiFetch("/api/faq-categories", {}, token),

  // ✅ Get single FAQ category by ID
  getById: (token: string, id: number): Promise<FaqCategory> =>
    apiFetch(`/api/faq-categories/${id}`, {}, token),

  // ✅ Create new FAQ category
  create: (token: string, data: Partial<FaqCategory>): Promise<FaqCategory> =>
    apiFetch(
      "/api/faq-categories",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  // ✅ Update FAQ category
  update: (token: string, id: number, data: Partial<FaqCategory>): Promise<FaqCategory> =>
    apiFetch(
      `/api/faq-categories/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  // ✅ Delete FAQ category
  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(
      `/api/faq-categories/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};
