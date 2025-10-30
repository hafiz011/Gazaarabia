"use client";

import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

export default function CategoryHeader({
  selectedSlug,
  title,
  description,
  parentCategory,
  categories,
  onCategoryChange,
}: {
  selectedSlug: string;
  title: string;
  description: string;
  parentCategory?: { slug: string; name?: string };
  categories: { slug: string; name: string }[];
  onCategoryChange?: (category: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeCategory, setActiveCategory] = useState(selectedSlug);
  const [mounted, setMounted] = useState(false);
  const [centered, setCentered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const handleCategoryClick = (slug: string) => {
    setActiveCategory(slug);
    onCategoryChange?.(slug);
  };

  // ✅ Dynamically center if total slide width < container width
  useEffect(() => {
    if (!mounted) return;
    const el = containerRef.current;
    if (!el) return;

    const swiperWrapper = el.querySelector(".swiper-wrapper") as HTMLElement;
    const swiperContainer = el.querySelector(".swiper") as HTMLElement;

    if (swiperWrapper && swiperContainer) {
      const totalWidth = swiperWrapper.scrollWidth;
      const visibleWidth = swiperContainer.clientWidth;
      setCentered(totalWidth < visibleWidth - 50); // add small tolerance
    }
  }, [categories, mounted]);

  if (!mounted) return null;

  return (
    <div
      ref={containerRef}
      className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 mb-12 text-center relative pt-20"
    >
      {/* 🔹 Title */}
      <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-wide capitalize mb-4">
        {title}
      </h1>

      {/* 🔹 Description */}
      {description && (
        <>
          <p
            className={`text-[var(--text-muted)] text-sm md:text-base leading-relaxed transition-all duration-300 ${
              expanded ? "line-clamp-none" : "line-clamp-3"
            }`}
          >
            {description}
          </p>

          {description.length > 120 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-[var(--text-primary)] font-medium mt-2 underline underline-offset-2 text-sm"
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </>
      )}

      {/* 🔹 Swiper Section */}
      <div className="mt-8 relative">
        <button
          type="button"
          className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 
            bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center 
            hover:bg-black/80 transition z-10 backdrop-blur-sm shadow-md"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 
            bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center 
            hover:bg-black/80 transition z-10 backdrop-blur-sm shadow-md"
        >
          <ChevronRight size={18} />
        </button>

        {/* ✅ Swiper */}
        <div
          className={`relative transition-all duration-300 ${
            centered ? "flex justify-center" : ""
          }`}
        >
          <Swiper
            modules={[Navigation, FreeMode]}
            slidesPerView="auto"
            spaceBetween={12}
            navigation={{
              nextEl: ".swiper-button-next-custom",
              prevEl: ".swiper-button-prev-custom",
            }}
            freeMode={{
              enabled: true,
              momentumRatio: 0.3,
            }}
            centeredSlides={false} // we handle centering manually
            className="!px-10"
          >
            {parentCategory && categories?.length > 0 && (
              <SwiperSlide className="!w-auto">
                <button
                  onClick={() => handleCategoryClick(parentCategory.slug)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
                    ${
                      activeCategory === parentCategory.slug
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black hover:bg-black hover:text-white"
                    }`}
                >
                  All
                </button>
              </SwiperSlide>
            )}

            {categories.map((cat, i) => (
              <SwiperSlide key={i} className="!w-auto">
                <button
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
                    ${
                      activeCategory === cat.slug
                        ? "bg-black text-white border-black"
                        : "border-gray-300 hover:border-black hover:bg-black hover:text-white"
                    }`}
                >
                  {cat.name}
                </button>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
