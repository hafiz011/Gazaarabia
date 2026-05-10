"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowRight, Award, TrendingUp } from "lucide-react";

interface BestSellerProduct {
  id: number;
  title: string;
  slug: string;
  sellingPrice: number;
  discountPrice?: number | null;
  productimage: { url: string }[];
  productvariant?: {
    id: number;
    color?: { id: number; name: string; hexCode: string } | null;
  }[];
}

interface BestSellersProps {
  products: BestSellerProduct[];
}

export default function BestSellers({ products }: BestSellersProps) {
  const router = useRouter();
  if (!products || products.length === 0) return null;

  const handleCardClick = (slug: string) => router.push(`/products/${slug}`);

  const featured = products.slice(0, 2);
  const gridItems = products.slice(2, 8);

  return (
    <section className="bg-[#FAFAFA] py-8 sm:py-12 md:py-20">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 md:px-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6 sm:mb-8 md:mb-14"
        >
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 text-amber-700 text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full mb-3 sm:mb-4 uppercase tracking-widest">
            <Award size={13} />
            Most Popular
          </div>
          <h2 className="text-2xl sm:text-[1.9rem] md:text-[2.6rem] font-bold tracking-tight text-gray-900">
            Best Sellers
          </h2>
          <div className="w-12 sm:w-16 h-[3px] bg-gradient-to-r from-amber-400 to-orange-500 mx-auto mt-2 sm:mt-3 mb-3 sm:mb-4 rounded-full" />
          <p className="text-gray-500 text-xs sm:text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed px-2">
            Our customers&apos; most loved pieces — tried, tested, and adored.
          </p>
        </motion.div>

        {/* Featured Row */}
        {featured.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-6 mb-2 sm:mb-3 md:mb-6">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                className="group cursor-pointer relative overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-sm hover:shadow-xl transition-shadow duration-500"
                onClick={() => handleCardClick(p.slug)}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5">
                    <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-white text-[10px] sm:text-sm font-bold">#{i + 1}</span>
                    </div>
                    <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-[9px] sm:text-xs font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm hidden sm:inline-block">
                      Best Seller
                    </span>
                  </div>
                  <Image
                    src={p.productimage?.[0]?.url || "/placeholder.jpg"}
                    alt={p.title}
                    fill
                    sizes="(max-width:640px) 50vw, 45vw"
                    className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 hidden sm:flex">
                    <span className="bg-white text-gray-900 text-xs font-semibold px-5 py-2 rounded-full shadow-lg uppercase tracking-wider">Quick View</span>
                  </div>
                </div>
                <div className="p-2 sm:p-4 md:p-5 text-center">
                  <h3 className="text-xs sm:text-base md:text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                    {p.title}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    {p.discountPrice && p.discountPrice < p.sellingPrice ? (
                      <>
                        <span className="text-[var(--brand-primary)] font-bold text-sm sm:text-lg">£{p.discountPrice}</span>
                        <span className="text-gray-400 line-through text-[10px] sm:text-sm">£{p.sellingPrice}</span>
                      </>
                    ) : (
                      <span className="text-[var(--brand-primary)] font-bold text-sm sm:text-lg">£{p.sellingPrice}</span>
                    )}
                  </div>
                  {p.productvariant && p.productvariant.filter(v => v.color).length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1.5 sm:mt-3">
                      {p.productvariant.filter(v => v.color).slice(0, 4).map((v) => (
                        <span key={v.id} className="w-2.5 h-2.5 sm:w-4 sm:h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: v.color?.hexCode }} title={v.color?.name} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Grid Row */}
        {gridItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-5">
            {gridItems.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.5 }}
                className="group cursor-pointer overflow-hidden rounded-lg sm:rounded-xl bg-white shadow-sm hover:shadow-lg transition-all duration-500"
                onClick={() => handleCardClick(p.slug)}
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden">
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
                    <span className="text-gray-700 text-[9px] sm:text-xs font-bold">#{i + 3}</span>
                  </div>
                  <Image
                    src={p.productimage?.[0]?.url || "/placeholder.jpg"}
                    alt={p.title}
                    fill
                    sizes="(max-width:640px) 50vw, (max-width:768px) 33vw, 25vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110"
                  />
                  {p.productimage?.[1] && (
                    <Image src={p.productimage[1].url} alt={`${p.title} alt`} fill sizes="(max-width:640px) 50vw, 25vw"
                      className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block" />
                  )}
                </div>
                <div className="p-2 sm:p-3 md:p-4 text-center">
                  <h3 className="text-[11px] sm:text-sm font-medium text-gray-900 line-clamp-2 min-h-[28px] sm:min-h-[36px] group-hover:text-[var(--brand-primary)] transition-colors leading-tight">
                    {p.title}
                  </h3>
                  <div className="flex items-center justify-center gap-1.5 mt-0.5 sm:mt-1">
                    {p.discountPrice && p.discountPrice < p.sellingPrice ? (
                      <>
                        <span className="text-[var(--brand-primary)] font-bold text-[13px] sm:text-[15px]">£{p.discountPrice}</span>
                        <span className="text-gray-400 line-through text-[10px] sm:text-xs">£{p.sellingPrice}</span>
                      </>
                    ) : (
                      <span className="text-[var(--brand-primary)] font-bold text-[13px] sm:text-[15px]">£{p.sellingPrice}</span>
                    )}
                  </div>
                  {p.productvariant && p.productvariant.filter(v => v.color).length > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1 sm:mt-2">
                      {p.productvariant.filter(v => v.color).slice(0, 3).map((v) => (
                        <span key={v.id} className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-gray-200" style={{ backgroundColor: v.color?.hexCode }} title={v.color?.name} />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 sm:mt-8 md:mt-10"
        >
          <button
            onClick={() => router.push("/shop/all?sort=bestseller")}
            className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs sm:text-sm font-semibold px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            <TrendingUp size={14} />
            Shop All Best Sellers
            <ArrowRight size={14} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
