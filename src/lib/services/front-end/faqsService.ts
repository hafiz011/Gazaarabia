import { apiFetch } from "../../api";

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

export const faqsService = {
  /** ✅ Get all FAQ categories */
  getAllCategories: (): Promise<{ data: FaqCategory[] }> =>
    apiFetch("/api/front-end/faq-categories"),

  /** ✅ Get all FAQs (optional filter by categoryId) */
  getAllFaqs: (params?: { categoryId?: number | string }): Promise<{ data: Faq[] }> => {
    const query = new URLSearchParams();
    if (params?.categoryId) query.append("categoryId", String(params.categoryId));

    return apiFetch(`/api/front-end/faqs${query.toString() ? `?${query.toString()}` : ""}`);
  },
};
