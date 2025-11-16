"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Heart, Plus, Star } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

import { formatSoldDuration } from "@/lib/utils";
interface ProductCardProps {
  product: any;
  onWishlistToggle?: (id: number, isInWishlist: boolean) => void;
}

export default function ProductCard({ product, onWishlistToggle }: ProductCardProps) {
  const router = useRouter();
  const [wishlist, setWishlist] = useState(product.isInWishlist);

  const handleCardClick = () => {
    router.push(`/products/${product.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !wishlist;
    setWishlist(newState);
    onWishlistToggle?.(product.id, newState);
  };

  const soldDurationLabel = formatSoldDuration(product.soldHighlightDuration);

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col w-full max-w-full sm:max-w-[280px] cursor-pointer"
    >
      {/* --- Image Section --- */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-20 bg-white border border-gray-200 hover:border-gray-300 rounded-full p-2 shadow-sm transition"
        >
          <Heart
            size={18}
            className={wishlist
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500 hover:fill-red-500"}
          />
        </button>

        {/* Sold Badge - FIXED */}
        {product.soldCount > 0 && soldDurationLabel && (
          <div className="absolute top-3 left-3 z-20 bg-black/80 text-white text-[10px] px-3 py-1 rounded-full shadow-sm">
            Sold {product.soldCount} in {soldDurationLabel}
          </div>
        )}

        {/* Images */}
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          className="w-full h-full"
        >
          {product.productimage.map((img: any, index: number) => (
            <SwiperSlide key={index}>
              <img
                src={img.url}
                alt={product.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* --- Content Section --- */}
      <div className="pt-4 px-1 text-center">

        {/* Product Title */}
        <h3 className="text-[15px] md:text-[16px] font-semibold text-gray-900 line-clamp-1">
          {product.title}
        </h3>

        {/* PRICE + RATING — Tight & Clean */}
        <div className="mt-2 flex items-center justify-center gap-3">

          {/* Price */}
          <p className="text-[var(--brand-primary)] font-semibold text-[15px]">
            £{product.sellingPrice || product.price}
          </p>

          {/* Rating — show only if rating > 0 */}
          {product.rating > 0 && product.reviewsCount > 0 && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium text-gray-800">{product.rating}</span>
              <span className="text-xs text-gray-500">({product.reviewsCount})</span>
            </div>
          )}

        </div>



        {/* Color Dots */}
        {product.productvariant?.length > 0 && (
          <div className="flex justify-center gap-2 mt-3">
            {product.productvariant.slice(0, 3).map((variant: any, idx: number) => (
              <span
                key={idx}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: variant.color?.hexCode }}
              />
            ))}

            {product.productvariant.length > 3 && (
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center text-[10px] text-gray-600">
                <Plus size={10} />
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
