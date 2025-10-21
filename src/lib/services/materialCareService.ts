export const materialCareService = {
  /**
   * ✅ Get all material care records (with optional search)
   */
  getAll: async (search?: string) => {
    let url = `/api/material-care`;
    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to fetch material care list (${res.status})`);
    }
    return res.json();
  },

  /**
   * ✅ Get a single record by ID (used in edit page)
   */
 getById: async (id: number) => {
  const res = await fetch(`/api/material-care/${id}`);
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  return json.data; // ✅ return only data
},


  /**
   * ✅ Create a new record
   */
  create: async (data: {
    title: string;
    description: string;
    careType?: string;
    material?: string;
  }) => {
    const res = await fetch(`/api/material-care`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create material care: ${errorText}`);
    }

    return res.json();
  },

  /**
   * ✅ Update an existing record
   */
  update: async (
    id: number,
    data: {
      title: string;
      description: string;
      careType?: string;
      material?: string;
    }
  ) => {
    const res = await fetch(`/api/material-care/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update material care: ${errorText}`);
    }

    return res.json();
  },

  /**
   * ✅ Delete a record
   */
  remove: async (id: number) => {
    const res = await fetch(`/api/material-care/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete material care: ${errorText}`);
    }
    return res.json();
  },
};

/**
 * ✅ TypeScript interface for MaterialCare
 */
export interface MaterialCare {
  id: number;
  title: string;
  description: string;
  careType?: string | null;
  material?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
