export const contactUsService = {
  async getAll(token: string) {
    const res = await fetch("/api/contact-us", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch contact messages");
    return res.json();
  },
};
