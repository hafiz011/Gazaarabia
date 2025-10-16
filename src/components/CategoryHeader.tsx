"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react"; // 👈 icons
import "swiper/css";
import "swiper/css/navigation";

export default function CategoryHeader({
    title,
    description,
    categories,
}: {
    title: string;
    description: string;
    categories: string[];
}) {
    const [expanded, setExpanded] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");

    return (
        <div className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 mb-12 text-center relative pt-20">
            <h1 className="text-3xl md:text-4xl font-semibold text-[var(--text-primary)] tracking-wide capitalize mb-4">
                {title}
            </h1>

            {/* 📄 Description */}
            <p
                className={`text-[var(--text-muted)] text-sm md:text-base leading-relaxed transition-all duration-300 ${expanded ? "line-clamp-none" : "line-clamp-3"
                    }`}
            >
                {description}
            </p>

            {/* 🔽 Read More Toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="text-[var(--text-primary)] font-medium mt-2 underline underline-offset-2 text-sm"
            >
                {expanded ? "Read less" : "Read more"}
            </button>

            {/* 🧭 Category Carousel */}
            <div className="mt-8 relative">
                {/* Custom Navigation Buttons */}
                <button
                    className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 
    bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center 
    hover:bg-black/80 transition z-10 backdrop-blur-sm shadow-md"
                >
                    <ChevronLeft size={18} />
                </button>

                <button
                    className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 
    bg-black/60 text-white rounded-full w-9 h-9 flex items-center justify-center 
    hover:bg-black/80 transition z-10 backdrop-blur-sm shadow-md"
                >
                    <ChevronRight size={18} />
                </button>

                <Swiper
                    modules={[Navigation]}
                    slidesPerView="auto"
                    spaceBetween={12}
                    navigation={{
                        nextEl: ".swiper-button-next-custom",
                        prevEl: ".swiper-button-prev-custom",
                    }}
                    breakpoints={{
                        0: { spaceBetween: 8 },
                        768: { spaceBetween: 12 },
                        1024: { spaceBetween: 16 },
                    }}
                    className="!px-10"
                >
                    {categories.map((cat, i) => (
                        <SwiperSlide key={i} className="!w-auto">
                            <button
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
            ${activeCategory === cat
                                        ? "bg-black text-white border-black"
                                        : "border-gray-300 hover:border-black hover:bg-black hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

        </div>
    );
}
