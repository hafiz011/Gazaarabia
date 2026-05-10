"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Palette } from "lucide-react";

interface ColorItem {
  id: number;
  name: string;
  hexCode: string;
  _count?: { productvariant: number };
}

interface ShopByColorProps {
  colors: ColorItem[];
}

export default function ShopByColor({ colors }: ShopByColorProps) {
  const router = useRouter();

  if (!colors || colors.length === 0) return null;

  const handleColorClick = (colorId: number) => {
    router.push(`/shop/all?colors[]=${colorId}`);
  };

  const isLightColor = (hex: string): boolean => {
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.75;
  };

  return (
    <section className="bg-white py-8 sm:py-12 md:py-20 overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 md:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-14"
        >
          <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 mb-3 sm:mb-4">
            <Palette size={18} className="text-purple-600 sm:hidden" />
            <Palette size={22} className="text-purple-600 hidden sm:block" />
          </div>
          <h2 className="text-2xl sm:text-[1.9rem] md:text-[2.6rem] font-bold tracking-tight text-gray-900">
            Shop by Color
          </h2>
          <div className="w-12 sm:w-16 h-[3px] bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 mx-auto mt-2 sm:mt-3 mb-3 sm:mb-4 rounded-full" />
          <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed px-2">
            Find your perfect shade — browse our collection by the colors you love.
          </p>
        </motion.div>

        {/* Color Swatches — scrollable on mobile, wrapped on desktop */}
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex sm:flex-wrap sm:justify-center gap-4 sm:gap-6 md:gap-10 min-w-max sm:min-w-0 pb-2 sm:pb-0">
            {colors.map((color, i) => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.06, 0.5), duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center gap-1.5 sm:gap-2.5 cursor-pointer group flex-shrink-0"
                onClick={() => handleColorClick(color.id)}
              >
                {/* Color Circle */}
                <div className="relative">
                  {/* Outer ring on hover */}
                  <div
                    className="absolute -inset-1 sm:-inset-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110"
                    style={{ border: `2px solid ${color.hexCode}` }}
                  />

                  {/* Main swatch */}
                  <div
                    className={`
                      w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full shadow-md
                      transition-all duration-500
                      group-hover:shadow-xl group-hover:scale-105
                      active:scale-95
                      ${isLightColor(color.hexCode) ? "border-2 border-gray-200" : "border border-transparent"}
                    `}
                    style={{ backgroundColor: color.hexCode }}
                  />

                  {/* Product count badge */}
                  {color._count && color._count.productvariant > 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 bg-gray-900 text-white text-[8px] sm:text-[9px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      {color._count.productvariant > 99 ? "99+" : color._count.productvariant}
                    </div>
                  )}
                </div>

                {/* Color Name */}
                <span className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors duration-300 text-center max-w-[60px] sm:max-w-[80px] leading-tight">
                  {color.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
