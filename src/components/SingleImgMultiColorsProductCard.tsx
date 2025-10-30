"use client";

import { ShoppingBag, Heart, Plus } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Product {
  id: number;
  title: string;
  price: string;
  img: string;
  colors?: string[];
  isNew?: boolean;
  isInWishlist?: boolean;
  slug?: string;
}

interface ProductCardProps {
  product: Product;
  removable?: boolean;
  // onRemove?: (product: Product) => void;
  onAddToBag?: (product: Product) => void | Promise<void>;
  // onToggleWishlist?: (product: Product) => void | Promise<void>;
  onWishlistToggle?: (id: number, isInWishlist: boolean) => void;

}

export default function SingleImgMultiColorProductCard({
  product,
  removable = false,
  // onRemove,
  onAddToBag,
  // onToggleWishlist,
  onWishlistToggle
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(product.isInWishlist ?? false);
  const router = useRouter();

  const handleCardClick = () => {
    if (product?.slug) {
      router.push(`/products/${product.slug}`);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((prev: any) => !prev);
    if (onWishlistToggle) onWishlistToggle(product.id, wishlisted);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 relative pointer-events-none"
    >

      {/*New Badge */}
      {product.isNew && (
        <span className="absolute top-3 left-3 z-20 bg-[var(--brand-primary)] text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide pointer-events-none">
          New In
        </span>
      )}

      <button
        type="button"
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-20 p-1.5 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition pointer-events-auto"

      >
        <Heart
          size={18}
          className={`transition ${wishlisted
              ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
              : "text-[var(--text-primary)] hover:fill-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
            }`}
        />
      </button>


      {/* 🖼️ Product Image */}
      <div
        onClick={handleCardClick}
        className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-[var(--brand-secondary)] pointer-events-auto"
      >
        <img
          src={product.img}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* 🏷️ Product Title */}
      <h3
        onClick={handleCardClick}
        className="mt-4 text-sm font-medium text-[var(--text-primary)] line-clamp-1 pointer-events-auto"
      >
        {product.title}
      </h3>

      {/* 💰 Price */}
      <p
        onClick={handleCardClick}
        className="mt-1 text-[var(--brand-primary)] text-sm font-semibold pointer-events-auto"
      >
        £{product.price}
      </p>

      {/* 🎨 Colors Section */}
      <div className="h-7 mt-2 flex justify-center items-center pointer-events-auto">
        {product.colors && product.colors.length > 0 ? (
          <div className="flex justify-center gap-2">
            {product.colors.slice(0, 4).map((color, index) => (
              <span
                key={index}
                className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
              ></span>
            ))}
            {product.colors.length > 4 && (
              // <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-center w-5 h-5 border rounded-full bg-[var(--soft-gray)]">
              //   +{product.colors.length - 4}
              // </span>

              <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm bg-white flex items-center justify-center text-[10px] font-medium text-[var(--text-primary)]">
                <Plus size={12} strokeWidth={2} />
              </div>

            )}
          </div>
        ) : (
          // 🟢 Empty placeholder to maintain height
          <div className="w-full h-full flex items-center justify-center"></div>
        )}
      </div>

      {/* 🛍️ Add to Bag */}
      <button
        onClick={handleCardClick}
        className="mt-3 flex items-center justify-center gap-1 text-xs font-medium border border-[var(--brand-secondary)] text-[var(--brand-secondary)] rounded-full py-2 hover:bg-[var(--brand-secondary)] hover:text-white transition pointer-events-auto"
      >
        <ShoppingBag size={14} />
        Add to Bag
      </button>
    </div>
  );
}
