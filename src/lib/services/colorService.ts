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
  getAll: (token: string): Promise<Color[]> =>
    apiFetch("/api/colors", {}, token),

  getById: (token: string, id: number): Promise<Color> =>
    apiFetch(`/api/colors/${id}`, {}, token),

  create: (token: string, data: Partial<Color>): Promise<Color> =>
    apiFetch("/api/colors", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (token: string, id: number, data: Partial<Color>): Promise<Color> =>
    apiFetch(`/api/colors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(`/api/colors/${id}`, {
      method: "DELETE",
    }, token),
};
