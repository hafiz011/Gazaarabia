export const authService = {
  signup: async (data: { name: string; email: string; password: string }) => {
    const res = await fetch("/api/front-end/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

  login: async (data: { email: string; password: string }) => {
    const baseUrl =
      typeof window === "undefined"
        ? process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL
        : "";

    const res = await fetch(`${baseUrl}/api/front-end/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Login failed");
    }

    return res.json();
  },

   getProfile: async (token:string) => {
    const res = await fetch("/api/front-end/profile", {
      method: "GET",
           headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,  //  send token in header
      },
    });
    if (!res.ok) throw new Error((await res.json()).message);
    return res.json();
  },

};
