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
  // ✅ Get all delivery options
  getAll: (): Promise<DeliveryOption[]> => apiFetch("/api/delivery-options"),

  // ✅ Get by ID
  getById: (id: number): Promise<DeliveryOption> =>
    apiFetch(`/api/delivery-options/${id}`),

  // ✅ Create a new delivery option
  create: (data: Partial<DeliveryOption>): Promise<DeliveryOption> =>
    apiFetch("/api/delivery-options", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // ✅ Update delivery option
  update: (id: number, data: Partial<DeliveryOption>): Promise<DeliveryOption> =>
    apiFetch(`/api/delivery-options/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // ✅ Delete delivery option
  remove: (id: number): Promise<{ message: string }> =>
    apiFetch(`/api/delivery-options/${id}`, {
      method: "DELETE",
    }),
};
