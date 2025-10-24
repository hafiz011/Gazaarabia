export const addressService = {
  // Get all addresses of the current user
  getAll: async (token: any) => {
    const res = await fetch("/api/front-end/addresses", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  //  send token in header
      },
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // Add a new address
  create: async (token: any, data: any) => {
    const res = await fetch("/api/front-end/addresses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  // send token in header
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // Update an address
  update: async (token: any, id: number, data: any) => {
    const res = await fetch(`/api/front-end/addresses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  //  send token in header
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  // Delete an address
  remove: async (token: any, id: number) => {
    const res = await fetch(`/api/front-end/addresses/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  //  send token in header
      },
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },
};
