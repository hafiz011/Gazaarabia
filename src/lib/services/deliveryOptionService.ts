import { apiFetch } from "../api";

export interface DeliveryOption {
  id: number;
  name: string;
  description?: string;
  minTime: number;
  maxTime: number;
  cutOffTime: string;
  cost: number;
  freeOver?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const deliveryOptionService = {
  getAll: (token: string): Promise<DeliveryOption[]> =>
    apiFetch("/api/delivery-options", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getById: (token: string, id: number): Promise<DeliveryOption> =>
    apiFetch(`/api/delivery-options/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (token: string, data: Partial<DeliveryOption>): Promise<DeliveryOption> =>
    apiFetch("/api/delivery-options", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (token: string, id: number, data: Partial<DeliveryOption>): Promise<DeliveryOption> =>
    apiFetch(`/api/delivery-options/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { Authorization: `Bearer ${token}` },
    }),

  remove: (token: string, id: number): Promise<{ message: string }> =>
    apiFetch(`/api/delivery-options/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }),
};
