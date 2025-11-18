"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { HandCoins, Users, Sparkles, ChartBar } from "lucide-react";
import { ROUTES } from "@/constants/routes";


export default function PartnerPage() {
    const programs = [
        {
            title: "Affiliate Program",
            subtitle: "Quick to join · Instant links · Monthly payouts",
            icon: <HandCoins size={44} />,
            bullets: [
                "Earn 10–15% commission per sale",
                "Custom referral link + coupon codes",
                "Real-time performance dashboard",
                "Monthly payouts, zero joining fee",
            ],
            accent: "var(--brand-primary)",
        },
        {
            title: "Ambassador Program",
            subtitle: "Creators & partners · Recurring revenue · Featured exposure",
            icon: <Users size={44} />,
            bullets: [
                "Higher-tier commissions & bonuses",
                "Recurring revenue from repeat customers",
                "Creative collaboration opportunities",
                "Featured spotlight & co-marketing",
            ],
            accent: "var(--brand-secondary)",
        },
    ];

    const benefits = [
        {
            title: "Transparent Reporting",
            text: "Granular analytics and real-time dashboards so you always know your performance.",
            icon: <ChartBar size={36} />,
        },
        {
            title: "Dedicated Support",
            text: "A partner success team focused on helping you grow and optimize earnings.",
            icon: <Sparkles size={36} />,
        },
        {
            title: "Reliable Payments",
            text: "Timely monthly payouts via your preferred payout method with clear statements.",
            icon: <HandCoins size={36} />,
        },
    ];

    return (
        <div className="w-full bg-[var(--background)] text-[var(--text-primary)]">
            {/* HERO */}
            <section className="relative overflow-hidden text-center py-20 md:py-28 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white">
                <div className="absolute inset-0 bg-black/18 backdrop-blur-sm" />
                {/* ambient shapes */}
                <div className="absolute -left-40 -top-20 w-[36rem] h-[36rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl"></div>
                <div className="absolute -right-40 -bottom-20 w-[36rem] h-[36rem] bg-[var(--brand-primary)] opacity-10 blur-3xl"></div>

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl md:text-5xl font-extrabold leading-tight mb-4"
                    >
                        Partner with Gazaarabia — Earn, Create, Grow
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.08 }}
                        className="text-base md:text-lg text-white/90 max-w-3xl mx-auto mb-6"
                    >
                        Join our Affiliate or Ambassador programs to monetize your audience, collaborate
                        creatively, and receive the support you need to scale.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.16 }}
                        className="flex items-center justify-center gap-4 flex-wrap"
                    >
                        <a
                            href="#programs"
                            className="inline-block px-6 py-3 rounded-lg font-semibold text-base"
                            style={{
                                background: "linear-gradient(90deg,var(--brand-primary), #c32230)",
                                color: "var(--white)",
                                boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
                            }}
                        >
                            Explore Programs
                        </a>

                        <a
                            href={ROUTES.AFFILIATE.REGISTER}
                            className="inline-block px-6 py-3 rounded-lg font-medium text-base"
                            style={{
                                background: "rgba(255,255,255,0.14)",
                                color: "var(--white)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            Become a Partner
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* WHY PARTNER */}
            <section className="py-16 md:py-20 bg-[var(--background)]">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--navy-blue)] mb-3">
                            Why partner with Gazaarabia?
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-3xl mx-auto">
                            We focus on predictable payouts, exceptional partner support, and marketing resources
                            so partners can focus on creating and converting.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {benefits.map((b, i) => (
                            <motion.div
                                key={b.title}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: i * 0.08 }}
                                className="p-6 rounded-2xl bg-[var(--white)] border border-[var(--mid-gray)] shadow-sm"
                            >
                                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-4"
                                    style={{ background: "var(--lavender-light)" }}>
                                    {b.icon}
                                </div>
                                <h4 className="font-semibold mb-2 text-[var(--navy-blue)]">{b.title}</h4>
                                <p className="text-[var(--text-muted)] text-sm">{b.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROGRAMS (Affiliate & Ambassador) */}
            <section id="programs" className="py-16 md:py-20 bg-[var(--soft-gray)] relative overflow-hidden">
                {/* ambient blobs */}
                <div className="absolute left-[-10rem] top-[-8rem] w-[30rem] h-[30rem] bg-[var(--brand-secondary)] opacity-6 blur-3xl"></div>
                <div className="absolute right-[-10rem] bottom-[-8rem] w-[30rem] h-[30rem] bg-[var(--brand-primary)] opacity-6 blur-3xl"></div>

                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--navy-blue)] mb-3">
                            Choose a program that fits you
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-3xl mx-auto">
                            Two straightforward paths — quick-join Affiliate for immediate earnings, or Ambassador
                            for creators who want deeper brand collaborations.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {programs.map((p, idx) => (
                            <motion.div
                                key={p.title}
                                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: idx * 0.08 }}
                                className="relative p-8 rounded-3xl bg-white border border-[var(--mid-gray)] shadow-lg"
                                style={{
                                    WebkitBackdropFilter: "saturate(120%) blur(6px)",
                                    backdropFilter: "saturate(120%) blur(6px)",
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className="w-16 h-16 rounded-xl flex items-center justify-center"
                                        style={{
                                            background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
                                            border: `1px solid ${p.accent}`,
                                            color: p.accent,
                                        }}
                                    >
                                        {p.icon}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-[var(--navy-blue)]">{p.title}</h3>
                                        <p className="text-[var(--text-secondary)] text-sm mt-1">{p.subtitle}</p>

                                        <ul className="mt-4 list-inside list-disc text-[var(--text-muted)] space-y-2">
                                            {p.bullets.map((b, i) => (
                                                <li key={i}>{b}</li>
                                            ))}
                                        </ul>

                                        <div className="mt-6 flex gap-3 flex-wrap">
                                            <a
                                                href={ROUTES.AFFILIATE.REGISTER}
                                                className="inline-block px-5 py-2 rounded-lg font-semibold text-sm"
                                                style={{
                                                    background: p.accent,
                                                    color: "var(--white)",
                                                    boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
                                                }}
                                            >
                                                Join {p.title.split(" ")[0]}
                                            </a>

                                            <a
                                                href="/contact"
                                                className="inline-block px-4 py-2 rounded-lg font-medium text-sm"
                                                style={{
                                                    background: "transparent",
                                                    color: "var(--text-primary)",
                                                    border: "1px solid var(--mid-gray)",
                                                }}
                                            >
                                                Learn More
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* subtle accent ribbon (top-right) */}
                                <div
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        right: "-28px",
                                        top: "-28px",
                                        width: "120px",
                                        height: "120px",
                                        background: `conic-gradient(${p.accent}, rgba(255,255,255,0.06))`,
                                        opacity: 0.06,
                                        transform: "rotate(25deg)",
                                        borderRadius: "20px",
                                    }}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="py-16 md:py-20 bg-[var(--background)]">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <h3 className="text-xl md:text-2xl font-semibold text-[var(--navy-blue)]">What our partners say</h3>
                        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">Real partners. Real earnings. Real stories.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                quote: "Joining the Affiliate program was frictionless — dashboards are accurate and payouts are reliable.",
                                name: "Ryan W.",
                                role: "Affiliate",
                            },
                            {
                                quote: "As an Ambassador, my creative work was promoted and my recurring earnings grew month-over-month.",
                                name: "Alicia G.",
                                role: "Ambassador",
                            },
                            {
                                quote: "Support is responsive and the dashboard makes it easy to optimize campaigns.",
                                name: "Marcus L.",
                                role: "Partner",
                            },
                        ].map((t, i) => (
                            <motion.blockquote
                                key={i}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: i * 0.06 }}
                                className="p-6 bg-[var(--soft-gray)] rounded-2xl border border-[var(--mid-gray)] text-[var(--text-secondary)]"
                            >
                                <p className="italic">“{t.quote}”</p>
                                <footer className="mt-4 font-medium text-[var(--text-primary)]">{t.name} <span className="text-[var(--text-muted)]">— {t.role}</span></footer>
                            </motion.blockquote>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 md:py-20 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white text-center">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl md:text-3xl font-semibold mb-3"
                    >
                        Ready to start earning?
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.06 }}
                        className="text-white/90 mb-6"
                    >
                        Sign up as an Affiliate or apply for Ambassador status — we’ll guide you through every step.
                    </motion.p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <a
                            href={ROUTES.AFFILIATE.REGISTER}
                            className="px-6 py-3 rounded-lg font-semibold"
                            style={{
                                background: "var(--brand-primary)",
                                color: "var(--white)",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
                            }}
                        >
                            Join Now
                        </a>

                        <a
                            href="mailto:support@gazaarabia.com"
                            className="px-5 py-3 rounded-lg font-medium"
                            style={{
                                background: "rgba(255,255,255,0.12)",
                                color: "var(--white)",
                                border: "1px solid rgba(255,255,255,0.08)",
                            }}
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </section>


            {/* Small inline styles to keep everything on-brand */}
            <style jsx>{`
        /* ensure lucide icons inherit color where used */
        svg { color: inherit; }

        /* subtle hover transitions for join buttons */
        a[style*="var(--brand-primary)"], a[style*="var(--brand-secondary)"] {
          transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
        }
        a[style*="var(--brand-primary)"]:hover,
        a[style*="var(--brand-secondary)"]:hover {
          transform: translateY(-3px);
          opacity: 0.98;
        }

        /* responsive tweaks */
        @media (max-width: 768px) {
          .py-20 { padding-top: 3rem; padding-bottom: 3rem; }
        }
      `}</style>
        </div>
    );
}
