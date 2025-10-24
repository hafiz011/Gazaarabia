"use client";

import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";

export interface Product {
  id: number | string;
  title: string;
  price: string;
  img: string;
  isNew?: boolean;
  isWishlisted?: boolean;
}

interface ProductCardProps {
  product: Product;
  removable?: boolean;
  onRemove?: (product: Product) => void;
  onAddToBag?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

export default function ProductCard({
  product,
  removable = false,
  onRemove,
  onAddToBag,
  onToggleWishlist,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(product.isWishlisted ?? false);

  const handleRemove = () => {
    setWishlisted(false);
    onRemove?.(product);
  };

  const handleToggleWishlist = () => {
    setWishlisted((prev) => !prev);
    onToggleWishlist?.(product);
  };

  return (
    <div className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 relative">
      {/* Heart icon when removable (remove from wishlist) */}
      {removable && (
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full border border-[var(--brand-secondary)] bg-[var(--white)] text-white hover:opacity-90 transition"
        >
          <Heart size={16} fill="currentColor" className="text-[var(--brand-primary)]" />

        </button>
      )}

      {/* 🆕 New Badge */}
      {product.isNew && (
        <span className="absolute top-3 left-3 z-20 bg-[var(--brand-primary)] text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide">
          New In
        </span>
      )}

      {/* 💖 Wishlist Icon (for non-removable cards e.g. product listing) */}
      {!removable && (
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-20 p-1.5 rounded-full border transition ${wishlisted
              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
              : "bg-white text-[var(--text-muted)] border-[var(--soft-gray)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]"
            }`}
        >
          <Heart size={16} fill={wishlisted ? "white" : "none"} />

          <Heart size={16} fill="currentColor" className={wishlisted ? "text-[var(--brand-primary)]" : "text-[var(--white)]"} />

        </button>
      )}

      {/* 🖼️ Product Image */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:ring-2 hover:ring-[var(--brand-secondary)]">
        <img
          src={product.img}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* 🏷️ Info */}
      <h3 className="mt-4 text-sm font-medium text-[var(--text-primary)] line-clamp-2">
        {product.title}
      </h3>
      <p className="mt-1 text-[var(--brand-primary)] text-sm font-semibold">
        {product.price}
      </p>

      {/* 🛍️ Add to Bag Button */}
      <button
        onClick={() => onAddToBag?.(product)}
        className="mt-3 flex items-center justify-center gap-1 text-xs font-medium border border-[var(--brand-secondary)] text-[var(--brand-secondary)] rounded-full py-2 hover:bg-[var(--brand-secondary)] hover:text-white transition"
      >
        <ShoppingBag size={14} />
        Add to Bag
      </button>
    </div>
  );
}
