"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function WearTheChange() {
  const stats = [
    { value: "£50,000+", label: "Raised for Gaza Communities" },
    { value: "200+", label: "Families Supported" },
    { value: "1,000+", label: "Customers Worldwide" },
  ];

  return (
    <section className="relative bg-gradient-to-r from-[#0B5636] via-[#5E4A42] to-[#B1333A] text-white pt-6 pb-16 md:pt-8 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />

      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[1.9rem] md:text-[2.4rem] font-semibold mb-3 leading-tight tracking-tight"
        >
          Wear the Change
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white/90 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          Every piece you wear becomes a statement of solidarity, style, and support
          for those who need it most.
        </motion.p>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="bg-white/10 backdrop-blur-md rounded-lg py-8 px-6 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_30px_rgba(0,0,0,0.15)] transition-all duration-500"
            >
              <h3 className="text-[1.8rem] md:text-[2rem] font-bold mb-1">
                {stat.value}
              </h3>
              <p className="text-white/85 text-sm md:text-base font-light">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="bg-white text-[var(--brand-secondary)] font-medium px-8 py-3 rounded-full flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
          >
            Shop Collection <ArrowRight size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="border border-white text-white font-medium px-8 py-3 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300"
          >
            Learn More About Our Impact
          </motion.button>
        </div>
      </div>
    </section>
  );
}
