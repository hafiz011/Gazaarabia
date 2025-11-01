export const contactService = {
  async sendMessage({
    name,
    email,
    subject,
    message,
  }: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      const res = await fetch("/api/front-end/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Contact form submission failed:", error);
      return { success: false, message: "Network error" };
    }
  },
};
