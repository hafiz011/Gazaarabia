"use client";

import { motion } from "framer-motion";
import Link from "next/link";


interface affiliateData {
    commission: number
}

interface affiliateProps {
    data: affiliateData
}


export default function BecomeAffiliateSection({ data }: affiliateProps) {
    return (
        <section className="relative w-full py-20 md:py-28 bg-[var(--lavender-light)] overflow-hidden">

            {/* Background Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--brand-primary)]/10 via-[var(--lavender)]/40 to-[var(--soft-pink)]/20 pointer-events-none" />

            {/* Floating Bubbles */}
            <motion.div
                className="absolute top-10 left-10 w-32 h-32 bg-[var(--soft-pink)]/40 rounded-full blur-3xl"
                initial={{ opacity: 0.2, y: 0 }}
                animate={{ opacity: 0.4, y: -30 }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "mirror" }}
            />

            <motion.div
                className="absolute bottom-20 right-20 w-40 h-40 bg-[var(--light-blue)]/40 rounded-full blur-[60px]"
                initial={{ opacity: 0.2, x: 0 }}
                animate={{ opacity: 0.35, x: 40 }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
            />

            <motion.div
                className="absolute top-1/2 left-1/3 w-24 h-24 bg-[var(--lavender)]/50 rounded-full blur-2xl"
                initial={{ opacity: 0.1, y: -20 }}
                animate={{ opacity: 0.25, y: 20 }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
            />

            {/* Main Wrapper */}
            <div className="relative max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">

                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1"
                >
                    <h2 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] leading-snug">
                        Become Our Affiliate
                        <br />
                        <span className="text-[var(--brand-primary)]">
                            {/* Earn Up to {data?.commission}% Commission */}
                            Earn Up to 10-15% Commission
                        </span>
                    </h2>

                    <p className="mt-4 text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-lg">
                        Join our affiliate community and earn generous commissions by promoting
                        our premium modestwear collections.
                        It’s free, quick, and open to everyone — start earning today.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mt-6"
                    >
                        <Link
                            href="/affiliate/register"
                            className="inline-block bg-[var(--brand-primary)] text-white px-6 py-3 rounded-lg 
                                    text-sm font-semibold shadow-md hover:bg-[var(--brand-primary)]/90 
                                    transition-all"
                        >
                            Join Affiliate Program
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Right Visual */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex-1 flex justify-center"
                >
                    <div className="relative">
                        {/* Glow behind the circle */}
                        <div className="absolute inset-0 w-full h-full bg-[var(--soft-pink)]/40 blur-3xl rounded-full"></div>

                        <div className="relative w-[260px] h-[260px] md:w-[320px] md:h-[320px] rounded-full 
                                        bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--lavender)] 
                                        shadow-lg flex items-center justify-center border-[6px] border-white/40">
                            <motion.span
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.8 }}
                                className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg"
                            >
                                {/* {data?.commission}% */}
                                10-15%
                            </motion.span>
                        </div>
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
