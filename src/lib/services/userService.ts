import { apiFetch } from "../api";

export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  role: {
    name: string;
  };
}

export const userService = {
  getAll: (token: string): Promise<User[]> =>
    apiFetch("/api/users", {}, token),

  remove: (token: any, id: number): Promise<{ message: string }> =>
    apiFetch(`/api/users/${id}`, { method: "DELETE" }, token),


  // Get user by ID
  getById: (token: string, id: number) =>
    apiFetch(`/api/users/${id}`, {}, token),

  // Create new user
  create: (token: string, data: any) =>
    apiFetch(
      "/api/users",
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      },
      token
    ),

  // Update user
  update: (token: string, id: number, data: any) =>
    apiFetch(
      `/api/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      },
      token
    ),



};


