import { apiFetch } from "../api";


export interface FaqCategory {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
   category?: FaqCategory;
}

export const faqService = {
  getAll: (token: string): Promise<Faq[]> =>
    apiFetch("/api/faqs", {}, token),

  getById: (token: string, id: number): Promise<Faq> =>
    apiFetch(`/api/faqs/${id}`, {}, token),

  create: (token: string, data: Partial<Faq>): Promise<Faq> =>
    apiFetch(
      "/api/faqs",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    ),

  update: (token: string, id: number, data: Partial<Faq>): Promise<Faq> =>
    apiFetch(
      `/api/faqs/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    ),

  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(
      `/api/faqs/${id}`,
      {
        method: "DELETE",
      },
      token
    ),
};
