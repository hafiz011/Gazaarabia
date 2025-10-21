import { apiFetch } from "../api";
import { Size } from "../types";

export const sizeService = {

  // get all sizes
  getAll: (): Promise<Size[]> => apiFetch("/api/sizes"),

  // get by id
   getById: (id: number): Promise<Size> =>
    apiFetch(`/api/sizes/${id}`),

  // add size
  create: (data: Partial<Size>): Promise<Size> =>
    apiFetch("/api/sizes", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // update size 
  update: (id: number, data: Partial<Size>): Promise<Size> =>
    apiFetch(`/api/sizes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // delete size
  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/sizes/${id}`, {
      method: "DELETE",
    }),
};
