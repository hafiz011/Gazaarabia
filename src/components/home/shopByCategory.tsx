"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface Category {
  src: string;
  label: string;
}

interface ShopByCategoryProps {
  categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  return (
    <section className="bg-[#FAFAFA] pt-4 md:pt-6 pb-16 md:pb-20">
      <div className="max-w-[1500px] mx-auto px-8 lg:px-20 text-center">
        {/* Section Heading */}
        <div className="mb-8 md:mb-10">
          <h2 className="text-[1.9rem] md:text-[2.4rem] font-semibold tracking-tight mb-3 text-[var(--text-primary)] inline-block relative">
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Shop by Category
            </span>
            {/* Underline */}
            <span className="block w-20 md:w-24 h-[3px] mx-auto mt-3 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]"></span>
          </h2>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed mt-2">
            Explore our curated collection of timeless essentials — crafted for the modern modest woman.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-8">
          {categories.map((cat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group cursor-pointer overflow-hidden rounded-[1.25rem] bg-white shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-700"
            >
              {/* Image */}
              <Image
                src={cat.src}
                alt={cat.label}
                width={500}
                height={600}
                className="w-full h-[340px] md:h-[420px] object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110"
                priority
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end pb-8">
                <h3 className="text-white text-base md:text-lg font-medium tracking-wide mb-1 drop-shadow-md">
                  {cat.label}
                </h3>
                <div className="h-[2px] w-8 bg-white/70 rounded-full group-hover:w-12 transition-all duration-500"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
