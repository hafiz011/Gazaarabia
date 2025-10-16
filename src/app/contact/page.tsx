"use client";

import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";
import { FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";

export default function ContactPage() {
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

            {/* 🧭 Contact Cards Section — Centered Layout */}
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
                            {/* ✨ Light gradient hover overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                            {/* Icon */}
                            <div className="relative z-10 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white mb-5 shadow-md group-hover:scale-110 transition-transform duration-500">
                                {item.icon}
                            </div>

                            {/* Text */}
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
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--black)] mb-4">
                            Send Us a Message
                        </h2>
                        <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
                            Fill out the form below and our support team will get back to you within 24 hours.
                        </p>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-10 rounded-2xl shadow-lg border border-[var(--mid-gray)]">
                        {/* Full Name */}
                        <div className="flex flex-col relative">
                            <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1 flex items-center gap-1">
                                Full Name <span className="text-[var(--brand-primary)]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="John Doe"
                                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col relative">
                            <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1 flex items-center gap-1">
                                Email <span className="text-[var(--brand-primary)]">*</span>
                            </label>
                            <input
                                type="email"
                                placeholder="john@example.com"
                                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
                                required
                            />
                        </div>

                        {/* Subject */}
                        <div className="md:col-span-2 flex flex-col relative">
                            <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1 flex items-center gap-1">
                                Subject <span className="text-[var(--brand-primary)]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="How can we help?"
                                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] transition-all"
                                required
                            />
                        </div>

                        {/* Message */}
                        <div className="md:col-span-2 flex flex-col relative">
                            <label className="absolute -top-2 left-3 bg-white text-xs font-semibold text-[var(--text-muted)] px-1 flex items-center gap-1">
                                Message <span className="text-[var(--brand-primary)]">*</span>
                            </label>
                            <textarea
                                placeholder="Write your message..."
                                rows={6}
                                className="border border-[var(--mid-gray)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)] resize-none transition-all"
                                required
                            ></textarea>
                        </div>

                        {/* CTA */}
                        <div className="md:col-span-2 flex justify-center">
                            <button
                                type="submit"
                                className="group relative inline-flex items-center justify-center overflow-hidden px-12 py-4 font-semibold text-white rounded-lg shadow-lg transition-all duration-500 bg-[var(--brand-primary)] hover:shadow-xl hover:scale-[1.02]"
                            >
                                {/* Gradient Overlay */}
                                <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                                {/* Button Text */}
                                <span className="relative z-10">Send Message</span>
                            </button>
                        </div>

                    </form>


                    {/* 🌐 Social Links */}
                    <div className="flex items-center justify-center gap-6 mt-14">
                        {[FaInstagram, FaFacebookF, FaTwitter].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="group relative w-12 h-12 rounded-full flex items-center justify-center text-[var(--brand-secondary)] border border-[var(--brand-secondary)] overflow-hidden transition-all duration-300 hover:shadow-md"
                            >
                                {/* Gradient background on hover */}
                                <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>

                                {/* Icon color change */}
                                <span className="relative z-10 text-lg text-[var(--brand-secondary)] group-hover:text-[var(--white)] transition-colors duration-300">
                                    <Icon />
                                </span>
                            </a>
                        ))}
                    </div>

                </div>
            </section>

            {/* 📍 Store Info + Map Section (Light) */}
            <section className="relative h-[600px] w-full overflow-hidden">
                {/* Map */}
                <iframe
                    title="Store Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.781019773899!2d77.20898537492437!3d28.57411788615766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2e68e2b72fb%3A0x1f9d6a2b24ef2a58!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1674034860378!5m2!1sen!2sin"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                {/* Light overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent"></div>

                {/* Floating Card */}
                <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center h-full justify-start md:justify-center">
                    <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-lg max-w-md border border-[var(--mid-gray)] text-center">
                        <h3 className="text-3xl font-bold text-[var(--black)] mb-4">
                            Visit Our <span className="text-[var(--brand-primary)]">Flagship Store</span>
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed text-sm">
                            Step into a world of timeless design and craftsmanship. Our showroom offers a curated experience to help you discover pieces that define your style.
                        </p>

                        <ul className="space-y-3 text-[var(--text-secondary)] text-sm mb-6">
                            <li><span className="text-[var(--brand-secondary)] font-semibold">📍</span> 123 Arab Street, New Delhi, India</li>
                            <li><span className="text-[var(--brand-secondary)] font-semibold">📞</span> +91 98765 43210</li>
                            <li><span className="text-[var(--brand-secondary)] font-semibold">🕒</span> Mon - Sat | 10 AM - 8 PM</li>
                        </ul>

                        <a
                            href="#"
                            className="relative inline-flex items-center justify-center overflow-hidden px-6 py-3 font-semibold text-white rounded-lg shadow-md bg-[var(--brand-primary)] hover:shadow-lg transition-all duration-500 hover:scale-[1.02]"
                        >
                            <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
                            <span className="relative z-10">Get Directions</span>
                        </a>
                    </div>
                </div>

                {/* Decorative Blur */}
                <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[var(--brand-secondary)] opacity-15 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            </section>
        </div>
    );
}
