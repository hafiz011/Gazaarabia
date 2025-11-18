"use client";

import { motion } from "framer-motion";

export default function TermsAndConditionsPage() {
    const sections = [
        {
            title: "1. Introduction",
            content: `Welcome to Gazaarabia. By accessing and using our website, products, or services, you agree to be bound by the following Terms and Conditions. Please read these carefully before making any purchase or using our platform.`,
        },
        {
            title: "2. Eligibility",
            content: `By using this site, you confirm that you are at least 18 years of age or are accessing the site under the supervision of a parent or legal guardian. All users agree to comply with applicable local and international laws.`,
        },
        {
            title: "3. Account Responsibilities",
            content: `You are responsible for maintaining the confidentiality of your account credentials and restricting access to your account. Gazaarabia will not be liable for any unauthorized activity that occurs under your account.`,
        },
        {
            title: "4. Orders & Payments",
            content: `All orders are subject to acceptance and availability. Prices may change without notice. Payment must be made using one of the accepted methods at checkout. Fraudulent activity or chargebacks may result in order cancellation.`,
        },
        {
            title: "5. Shipping & Delivery",
            content: `We aim to deliver your products in a timely manner. However, we are not liable for delays caused by third-party logistics, natural calamities, or other unforeseen events.`,
        },
        {
            title: "6. Returns & Refunds",
            content: `Returns are accepted within the policy period and must comply with our return conditions. Refunds will be processed after product inspection and may take up to 7 business days.`,
        },
        {
            title: "7. Intellectual Property",
            content: `All content on this website — including text, graphics, logos, and images — is the property of Gazaarabia and is protected by applicable copyright and intellectual property laws.`,
        },
        {
            title: "8. Limitation of Liability",
            content: `Gazaarabia shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the services.`,
        },
        {
            title: "9. Governing Law",
            content: `These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.`,
        },
        {
            title: "10. Contact Information",
            content: `If you have any questions or concerns regarding these Terms & Conditions, please contact our Legal Team.`,
        },
    ];

    return (
        <div className="w-full bg-white text-[var(--text-primary)]">
            {/* HERO */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Terms & Conditions
                    </h1>
                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Please review the terms carefully before using our website or services.
                        By accessing Gazaarabia, you agree to these terms in full.
                    </p>
                </div>
            </section>

            {/*  CONTENT */}
            <section className="relative py-16 bg-[var(--soft-gray)] overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    {/* Intro */}
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--brand-primary)] mb-3">
                            Our Legal Agreement with You
                        </h2>
                        <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                            These Terms & Conditions define your legal rights and obligations when
                            using Gazaarabia. By continuing to browse or shop, you accept these terms.
                        </p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-14">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3 text-center md:text-left">
                                    {section.title}
                                </h3>
                                <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-4xl mx-auto">
                                    {section.content}
                                </p>

                                {section.title === "10. Contact Information" && (
                                    <div className="mt-6 flex justify-center">
                                        <a
                                            href="mailto:legal@gazaarabia.com"
                                            className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition text-base"
                                        >
                                            Contact Our Legal Team
                                        </a>
                                    </div>
                                )}

                                {index !== sections.length - 1 && (
                                    <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-16 pt-6 border-t border-[var(--mid-gray)] text-center text-sm text-[var(--text-muted)]">
                        <p>© {new Date().getFullYear()} Gazaarabia. All rights reserved.</p>
                        <p className="mt-1">Last Updated: October 16, 2025</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
