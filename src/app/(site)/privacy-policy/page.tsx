"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "1. Information We Collect",
            content: `We collect both personal and non-personal information. This includes your name, email address, phone number, billing and shipping details, and payment information when you register or make a purchase. Additionally, we collect technical data such as IP address, device information, and browsing behavior to enhance user experience and security.`,
        },
        {
            title: "2. How We Use Your Information",
            content: `Your data is used to process transactions, deliver products, enhance customer experience, and communicate with you regarding your orders or updates. We do not sell or rent your personal data to third parties.`,
        },
        {
            title: "3. Data Protection & Security",
            content: `We use industry-leading encryption technologies, secure servers, and compliant payment gateways to ensure your data remains protected. All financial information is transmitted securely and is not stored on our systems.`,
        },
        {
            title: "4. Use of Cookies",
            content: `Cookies allow us to personalize content, remember your preferences, and analyze site traffic. You can manage cookie preferences through your browser settings at any time.`,
        },
        {
            title: "5. Your Rights",
            content: `You have the right to access, update, or delete your personal data. You may also withdraw consent for marketing communications by unsubscribing or contacting us directly.`,
        },
        {
            title: "6. Policy Updates",
            content: `We may periodically update this Privacy Policy to reflect changes in regulations, technology, or our practices. Any modifications will be posted on this page with an updated effective date.`,
        },
        {
            title: "7. Contact Information",
            content: `For questions, requests, or concerns regarding your privacy, please contact our dedicated Privacy Team.`,
        },
    ];

    return (
        <div className="w-full bg-white text-[var(--text-primary)]">
            {/* 🪄 HERO SECTION */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        This Privacy Policy outlines how Gazaarabia collects, uses, and protects your information with transparency and care.
                    </p>
                </div>
            </section>

            {/* 📄 MAIN CONTENT */}
            <section className="relative py-20 bg-[var(--soft-gray)] overflow-hidden">
                {/* Visual Decorations */}
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    {/* Intro */}
                    <div className="text-center mb-14">
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--brand-primary)] mb-4">
                            Our Commitment to Privacy
                        </h2>
                        <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                            We prioritize your privacy through secure technology, transparent communication, and full compliance with global data protection regulations.
                        </p>
                    </div>

                    {/* Policy Sections */}
                    <div className="space-y-16">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-xl md:text-2xl font-semibold text-[var(--brand-primary)] mb-4 text-center md:text-left">
                                    {section.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-4xl mx-auto">
                                    {section.content}
                                </p>

                                {section.title === "7. Contact Information" && (
                                    <div className="mt-6 flex justify-center">
                                        <a
                                            href="mailto:support@gazaarabia.com"
                                            className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition text-base"
                                        >
                                            Contact Our Privacy Team
                                        </a>
                                    </div>
                                )}

                                {index !== sections.length - 1 && (
                                    <div className="mt-12 border-b border-[var(--mid-gray)] opacity-30"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-20 pt-6 border-t border-[var(--mid-gray)] text-center text-sm text-[var(--text-muted)]">
                        <p>© {new Date().getFullYear()} Gazaarabia. All rights reserved.</p>
                        <p className="mt-1">Last Updated: October 16, 2025</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
