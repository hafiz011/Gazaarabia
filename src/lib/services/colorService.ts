import { apiFetch } from "../api";

export interface Color {
  id: number;
  name: string;
  slug?: string;
  hexCode: string;
  rgbCode?: string;
  description?: string;
  createdAt: string;
}

export const colorService = {
  getAll: (): Promise<Color[]> =>
    apiFetch("/api/colors"),

  getById: (id: number): Promise<Color> =>
    apiFetch(`/api/colors/${id}`),

  create: (data: Partial<Color>): Promise<Color> =>
    apiFetch("/api/colors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<Color>): Promise<Color> =>
    apiFetch(`/api/colors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/colors/${id}`, {
      method: "DELETE",
    }),
};
