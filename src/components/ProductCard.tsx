"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Heart, Plus } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

export default function ProductCard({ product }: { product: any }) {
    const [wishlist, setWishlist] = useState(false);

    return (
        <div className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 w-full">

            {/* 🖼 Image container */}
            <div className="relative w-full h-[50vh] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300">
                {/* 🏷 Label */}
                {product.label && (
                    <div className="absolute top-4 left-4 z-20 bg-white text-[var(--text-primary)] text-[10px] font-semibold uppercase rounded-full shadow-sm flex items-center justify-center w-12 h-12 border border-gray-200">
                        {product.label}
                    </div>
                )}

                {/* ❤️ Wishlist */}
                <button
                    type="button"
                    aria-label="Add to wishlist"
                    onClick={() => setWishlist(!wishlist)}
                    className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition"
                >
                    <Heart
                        size={18}
                        className={`transition ${wishlist
                            ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                            : "text-[var(--text-primary)] hover:fill-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                            }`}
                    />
                </button>

                {/* 🖼 Product Image Carousel */}
                <Swiper
                    modules={[Pagination]}
                    pagination={{
                        clickable: true,
                        bulletClass: "swiper-pagination-bullet custom-bullet",
                        bulletActiveClass: "swiper-pagination-bullet-active custom-bullet-active",
                    }}
                    slidesPerView={1}
                    className="absolute inset-0 w-full h-full"
                >
                    {product.images.map((img: string, index: number) => (
                        <SwiperSlide key={index}>

                            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white">
                                <img
                                    src={img}
                                    alt={product.title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>

                        </SwiperSlide>
                    ))}
                </Swiper>

            </div>

            {/* 📝 Product Info */}
            <div className="mt-4">
                <h3 className="text-base md:text-lg font-medium text-[var(--text-primary)] truncate">
                    {product.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--text-primary)] mt-1 font-semibold">
                    {product.price}
                </p>

                {/* 🎨 Color Circle */}
                {product.colors && product.colors.length > 0 && (
                    <div className="flex justify-center mt-3 gap-2">
                        {product.colors.slice(0, 3).map((color: string, index: number) => (
                            <div
                                key={index}
                                className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: color }}
                            ></div>
                        ))}
                        {product.colors.length > 3 && (
                            <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm bg-white flex items-center justify-center text-[10px] font-medium text-[var(--text-primary)]">
                                <Plus size={12} strokeWidth={2} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
