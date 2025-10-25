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

};


