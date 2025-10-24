"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { Heart, Plus } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";

interface ProductCardProps {
  product: any;
  onWishlistToggle?: (id: number, isInWishlist: boolean) => void;
}

export default function ProductCard({ product, onWishlistToggle }: ProductCardProps) {
  const [wishlist, setWishlist] = useState(product.isInWishlist || false);
  const router = useRouter();

  const handleCardClick = () => {
    if (product?.slug) router.push(`/products/${product.slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev:any) => !prev);
    if (onWishlistToggle) onWishlistToggle(product.id, wishlist);
  };

  return (
    <div
      className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 w-full max-w-[320px]"
      onClick={handleCardClick}
    >
      {/* 🖼 Image container */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300">
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
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition"
        >
          <Heart
            size={18}
            className={`transition ${
              wishlist
                ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                : "text-[var(--text-primary)] hover:fill-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            }`}
          />
        </button>

        {/* 🖼 Swiper Carousel */}
        <Swiper
          modules={[Pagination]}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet custom-bullet",
            bulletActiveClass:
              "swiper-pagination-bullet-active custom-bullet-active",
          }}
          slidesPerView={1}
          className="absolute inset-0 w-full h-full"
        >
          {product.productimage?.map((img: any, index: number) => (
            <SwiperSlide key={index}>
              <div className="relative w-full h-full">
                <img
                  src={img?.url}
                  alt={product.title}
                  className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
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
        <p className="text-sm md:text-base text-[var(--brand-primary)] mt-1 font-semibold">
          £{product.sellingPrice || product.price}
        </p>

        {/* 🎨 Color Section */}
        {product.productvariant && product.productvariant.length > 0 && (
          <div className="flex justify-center mt-3 gap-2">
            {product.productvariant.slice(0, 3).map((variant: any, index: number) => (
              <div
                key={index}
                className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: variant?.color?.hexCode }}
              ></div>
            ))}
            {product.productvariant.length > 3 && (
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
