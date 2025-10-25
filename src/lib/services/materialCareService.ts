export const materialCareService = {
  /**
   * Get all material care records (with optional search)
   */
  getAll: async (token: string, search?: string) => {
    let url = `/api/material-care`;
    if (search) url += `?search=${encodeURIComponent(search)}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch material care list (${res.status})`);
    return res.json();
  },

  /**
   *  Get a single record by ID (used in edit page)
   */
  getById: async (token: string, id: number) => {
    const res = await fetch(`/api/material-care/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch material care");
    const json = await res.json();
    return json.data;
  },

  /**
   *  Create a new record
   */
  create: async (
    token: string,
    data: {
      title: string;
      description: string;
      careType?: string;
      material?: string;
      icon?: string;
    }
  ) => {
    const res = await fetch(`/api/material-care`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create material care: ${errorText}`);
    }
    return res.json();
  },

  /**
   *  Update an existing record
   */
  update: async (
    token: string,
    id: number,
    data: {
      title: string;
      description: string;
      careType?: string;
      material?: string;
      icon?: string;
    }
  ) => {
    const res = await fetch(`/api/material-care/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update material care: ${errorText}`);
    }
    return res.json();
  },

  /**
   * Delete a record
   */
  remove: async (token: string, id: number) => {
    const res = await fetch(`/api/material-care/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete material care: ${errorText}`);
    }
    return res.json();
  },
};

/**
 *  TypeScript interface for MaterialCare
 */
export interface MaterialCare {
  id: number;
  title: string;
  description: string;
  careType?: string | null;
  material?: string | null;
  icon?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
