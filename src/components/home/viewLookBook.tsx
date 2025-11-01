"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function ViewLookbook() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* Background Image */}
      <div className="relative w-full h-[65vh] md:h-[80vh]">
        <Image
          src="/images/home/lookbook-banner.png" // replace with your own banner
          alt="View Lookbook"
          fill
          priority
          className="object-cover object-center transition-transform duration-[3000ms] ease-[cubic-bezier(0.19,1,0.22,1)] hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Overlay Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-white text-[2.2rem] md:text-[3rem] font-semibold tracking-wide"
        >
          <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
            View Lookbook
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-white/80 text-sm md:text-lg max-w-xl leading-relaxed mt-3 mb-8"
        >
          A visual story of grace, texture, and timeless modest fashion.
        </motion.p>

        <motion.button
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white text-sm md:text-base font-medium tracking-wide hover:opacity-90 transition-all duration-300"
        >
          Explore Now <ArrowRight size={18} />
        </motion.button>
      </div>
    </section>
  );
}
