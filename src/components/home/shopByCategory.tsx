"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

interface ShopByCategoryProps {
  categories: Category[];
}

export default function ShopByCategory({ categories }: ShopByCategoryProps) {
  const router = useRouter();

  const handleCardClick = (item: any) => {
    if (item?.slug) {
      router.push(`/shop/${item.slug}`);
    } else {
      console.warn("Category slug is missing:", item);
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-[#FAFAFA] py-8 sm:py-12 md:py-20">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 md:px-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-14"
        >
          <h2 className="text-2xl sm:text-[1.9rem] md:text-[2.6rem] font-bold tracking-tight text-gray-900">
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Shop by Category
            </span>
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-[3px] mx-auto mt-2 sm:mt-3 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]" />
          <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed mt-3 sm:mt-4 px-2">
            Explore our curated collection of timeless essentials — crafted for the modern modest woman.
          </p>
        </motion.div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[160px] sm:auto-rows-[200px] md:auto-rows-[240px] gap-2 sm:gap-3 md:gap-4">
          {categories.map((cat, index) => {
            const isLarge = index === 0;
            const isWide = index === 3 || index === 6;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
                className={`
                  relative group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl
                  ${isLarge ? "row-span-2" : ""}
                  ${isWide ? "md:col-span-2" : ""}
                `}
                onClick={() => handleCardClick(cat)}
              >
                {/* Image */}
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes={`${isLarge ? "(max-width:640px) 50vw, 25vw" : isWide ? "(max-width:640px) 50vw, 50vw" : "(max-width:640px) 50vw, 25vw"}`}
                  className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110"
                  priority={index < 4}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                {/* Text Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 sm:pb-6 md:pb-8 px-2 sm:px-4">
                  <h3 className={`
                    text-white font-semibold tracking-wide drop-shadow-lg text-center leading-tight
                    ${isLarge ? "text-base sm:text-xl md:text-2xl mb-1 sm:mb-2" : "text-sm sm:text-base md:text-lg mb-1 sm:mb-1.5"}
                  `}>
                    {cat.name}
                  </h3>

                  {/* Animated underline */}
                  <div className="h-[2px] w-6 sm:w-8 bg-white/70 rounded-full group-hover:w-10 sm:group-hover:w-14 transition-all duration-500" />

                  {/* Shop Now label on hover — hidden on mobile for cleaner look */}
                  <div className="items-center gap-1.5 mt-2 sm:mt-3 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 hidden sm:flex">
                    <span className="text-white text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                      Shop Now
                    </span>
                    <ArrowRight size={12} className="text-white sm:w-3.5 sm:h-3.5" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
