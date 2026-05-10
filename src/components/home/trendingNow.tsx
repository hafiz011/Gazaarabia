"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, ChevronRight, Flame } from "lucide-react";
import { useRef } from "react";
import type { Swiper as SwiperType } from "swiper";

interface TrendingProduct {
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

interface TrendingNowProps {
  products: TrendingProduct[];
}

export default function TrendingNow({ products }: TrendingNowProps) {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);

  if (!products || products.length === 0) return null;

  const handleCardClick = (slug: string) => {
    router.push(`/products/${slug}`);
  };

  return (
    <section className="relative bg-white py-8 sm:py-10 md:py-16 overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-3 sm:px-4 md:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-5 sm:mb-6 md:mb-10"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-200/50 flex-shrink-0">
              <Flame size={16} className="text-white sm:hidden" />
              <Flame size={20} className="text-white hidden sm:block" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl md:text-[2.2rem] font-bold tracking-tight text-gray-900">
                Trending Now
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5 hidden sm:block">
                What everyone is loving right now
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Custom Nav Arrows — hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center transition-all hover:bg-gray-50"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => swiperRef.current?.slideNext()}
                className="w-10 h-10 rounded-full border border-gray-200 hover:border-gray-400 flex items-center justify-center transition-all hover:bg-gray-50"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>

            <button
              onClick={() => router.push("/shop/all?sort=new")}
              className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium text-gray-700 hover:text-black transition-colors group whitespace-nowrap"
            >
              View All
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform sm:w-4 sm:h-4" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div className="overflow-hidden -mx-1 px-1">
          <Swiper
            onSwiper={(swiper) => { swiperRef.current = swiper; }}
            modules={[Autoplay, Navigation]}
            autoplay={{ delay: 4500, disableOnInteraction: false }}
            spaceBetween={8}
            slidesPerView={2}
            loop={products.length > 4}
            speed={700}
            breakpoints={{
              380: { slidesPerView: 2.15, spaceBetween: 8 },
              480: { slidesPerView: 2.3, spaceBetween: 10 },
              640: { slidesPerView: 2.5, spaceBetween: 14 },
              768: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 4, spaceBetween: 18 },
              1400: { slidesPerView: 5, spaceBetween: 20 },
            }}
            className="!overflow-visible"
          >
            {products.map((p, i) => (
              <SwiperSlide key={p.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(i * 0.08, 0.4), duration: 0.5 }}
                  className="group cursor-pointer"
                  onClick={() => handleCardClick(p.slug)}
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden rounded-lg sm:rounded-xl bg-gray-100">
                    {/* Trending Badge */}
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[8px] sm:text-[10px] font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-md uppercase tracking-wider">
                      Trending
                    </div>

                    <Image
                      src={p.productimage?.[0]?.url || "/placeholder.jpg"}
                      alt={p.title}
                      fill
                      sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110"
                    />

                    {/* Hover overlay with second image — desktop only */}
                    {p.productimage?.[1] && (
                      <Image
                        src={p.productimage[1].url}
                        alt={`${p.title} - alternate`}
                        fill
                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        className="object-cover absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 hidden sm:block"
                      />
                    )}

                    {/* Bottom gradient */}
                    <div className="absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>

                  {/* Product Info */}
                  <div className="pt-2 sm:pt-3 pb-1">
                    <h3 className="text-xs sm:text-sm md:text-[15px] font-medium text-gray-900 line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-[var(--brand-primary)] transition-colors duration-300 leading-tight">
                      {p.title}
                    </h3>

                    <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
                      {p.discountPrice && p.discountPrice < p.sellingPrice ? (
                        <>
                          <span className="text-[var(--brand-primary)] font-bold text-[13px] sm:text-[15px]">
                            £{p.discountPrice}
                          </span>
                          <span className="text-gray-400 line-through text-[10px] sm:text-xs">
                            £{p.sellingPrice}
                          </span>
                        </>
                      ) : (
                        <span className="text-[var(--brand-primary)] font-bold text-[13px] sm:text-[15px]">
                          £{p.sellingPrice}
                        </span>
                      )}
                    </div>

                    {/* Color dots */}
                    {p.productvariant && p.productvariant.length > 0 && (
                      <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2.5">
                        {p.productvariant
                          .filter((v) => v.color)
                          .slice(0, 4)
                          .map((v) => (
                            <span
                              key={v.id}
                              className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-200 shadow-sm"
                              style={{ backgroundColor: v.color?.hexCode }}
                              title={v.color?.name}
                            />
                          ))}
                        {p.productvariant.filter((v) => v.color).length > 4 && (
                          <span className="text-[9px] sm:text-[10px] text-gray-400 font-medium ml-0.5">
                            +{p.productvariant.filter((v) => v.color).length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
