"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface affiliateData {
    commission: number;
}

interface affiliateProps {
    data: affiliateData;
}

export default function BecomeAffiliateSection({ data }: affiliateProps) {
    return (
        <section className="w-full py-16 bg-[var(--background)] border-t border-[var(--soft-gray)]">

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">

                {/* LEFT CONTENT */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] leading-tight">
                        Join Our Affiliate Program
                    </h2>

                    <p className="mt-3 text-lg text-[var(--text-secondary)] leading-relaxed max-w-md">
                        Partner with us and earn competitive commissions by promoting our premium modestwear.
                        No fees, no complexity — just a simple way to grow your income.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-7"
                    >
                        <Link
                            href="/affiliate/register"
                            className="inline-block bg-[var(--brand-primary)] text-white px-7 py-3.5 rounded-md 
              text-sm font-medium shadow-sm hover:bg-[var(--brand-primary)]/90 transition"
                        >
                            Become an Affiliate
                        </Link>
                    </motion.div>
                </motion.div>

                {/* RIGHT — PROFESSIONAL STAT CARD */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-center"
                >
                    <div className="w-full max-w-sm bg-white border border-[var(--soft-gray)] rounded-xl shadow-sm p-8 text-center">

                        <div className="text-[var(--brand-primary)] text-5xl font-bold leading-none">
                            10–15%
                        </div>

                        <p className="mt-2 text-[var(--text-primary)] font-medium text-lg">
                            Commission Rate
                        </p>

                        <p className="text-[var(--text-secondary)] text-sm mt-2">
                            Earn consistently for every successful referral you generate.
                        </p>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
