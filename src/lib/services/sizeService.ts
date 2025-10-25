import { apiFetch } from "../api";
import { Size } from "../types";

export const sizeService = {
  getAll: (token: any): Promise<Size[]> =>
    apiFetch("/api/sizes", {}, token),

  getById: ( token: any, id: number): Promise<Size> =>
    apiFetch(`/api/sizes/${id}`, {}, token),

  create: ( token: any, data: Partial<Size>): Promise<Size> =>
    apiFetch("/api/sizes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: ( token: any, id: number, data: Partial<Size>): Promise<Size> =>
    apiFetch(`/api/sizes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  remove: ( token: any, id: number): Promise<{ message: string }> =>
    apiFetch(`/api/sizes/${id}`, {
      method: "DELETE",
    }, token),
};
