"use client";

import { useState } from "react";
import { contactService } from "@/lib/services/front-end/contactService";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface, AlertInterface } from "@/lib/types";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const [alertMessageData, setAlertMessageData] = useState<AlertInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Please fill in all required fields before submitting.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setLoading(true);
      setAlertMessageData({ isOpen: false, type: "", message: "" });

      const res = await contactService.sendMessage(formData);

      if (res.success) {
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Your message has been sent successfully!",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setAlertMessageData({
          isOpen: true,
          type: "error",
          message: res.message || "Failed to send message. Please try again.",
        });
      }
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full text-[var(--text-primary)]">
      {/* 🪄 Hero Section */}
      <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-24 md:py-28 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-wide">
            Get in Touch with <span className="text-[var(--white)]">Gaza Arabia</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-white/90 leading-relaxed">
            Have a question about your order, products, or collaborations? Our team is here to support you every step of the way.
          </p>
        </div>
      </section>

      {/* 🧭 Contact Cards Section */}
      <section className="py-20 bg-[var(--soft-gray)]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: <FaEnvelope className="text-3xl" />, title: "Email Us", detail: "support@gazaarabia.com" },
            { icon: <FaPhoneAlt className="text-3xl" />, title: "Call Us", detail: "+91 98765 43210" },
            { icon: <FaMapMarkerAlt className="text-3xl" />, title: "Visit Us", detail: "123 Arab Street, New Delhi" },
          ].map((item, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-center justify-center bg-white rounded-2xl p-10 text-center shadow-sm border border-[var(--mid-gray)] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-500">
                {item.icon}
              </div>
              <h3 className="relative z-10 text-xl font-semibold text-[var(--black)] mb-2 transition-colors duration-500">
                {item.title}
              </h3>
              <p className="relative z-10 text-[var(--text-secondary)] text-base leading-relaxed transition-colors duration-500">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 📝 Contact Form Section */}
      <section className="relative bg-white py-24 md:py-28 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 rounded-full blur-3xl -translate-x-24 -translate-y-24"></div>
        <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 rounded-full blur-3xl translate-x-24 translate-y-24"></div>

        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--black)] mb-4">Send Us a Message</h2>
            <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
              Fill out the form below and our support team will get back to you within 24 hours.
            </p>
          </div>

          {alertMessageData.isOpen && alertMessageData.type && (
            <AlertMessage
              type={alertMessageData.type}
              message={alertMessageData.message}
              onClose={() => setAlertMessageData((prev) => ({ ...prev, isOpen: false }))}
            />
          )}

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-10 rounded-2xl shadow-lg border border-[var(--mid-gray)]"
          >
            <div className="flex flex-col relative">
              <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1">
                Full Name <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
              />
            </div>

            <div className="flex flex-col relative">
              <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1">
                Email <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
              />
            </div>

            <div className="md:col-span-2 flex flex-col relative">
              <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1">
                Subject <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
              />
            </div>

            <div className="md:col-span-2 flex flex-col relative">
              <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1">
                Message <span className="text-[var(--brand-primary)]">*</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message..."
                rows={6}
                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] resize-none transition-all"
              ></textarea>
            </div>

            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`${loading ? "opacity-70 cursor-not-allowed" : ""} group relative inline-flex items-center justify-center overflow-hidden px-12 py-4 font-semibold text-white rounded-lg shadow-lg transition-all duration-500 bg-[var(--brand-primary)] hover:shadow-xl hover:scale-[1.02]`}
              >
                <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10">{loading ? "Sending..." : "Send Message"}</span>
              </button>
            </div>
          </form>

          <PopupAlert
            type={popUpAlertData.type as any}
            message={popUpAlertData.message}
            confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
            cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
            onConfirm={popUpAlertData.onConfirm}
            onCancel={popUpAlertData.onCancel}
            show={popUpAlertData.isOpen}
          />

          {/* 🌐 Social Links */}
          <div className="flex items-center justify-center gap-6 mt-14">
            {[FaInstagram, FaFacebookF, FaTwitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="group relative w-12 h-12 rounded-full flex items-center justify-center text-[var(--brand-secondary)] border border-[var(--brand-secondary)] overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="relative z-10 text-lg text-[var(--brand-secondary)] group-hover:text-[var(--white)] transition-colors duration-300">
                  <Icon />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
