"use client";

import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface Product {
  id: number | string;
  title: string;
  price: string;
  img: string;
  isNew?: boolean;
  isWishlisted?: boolean;
  slug?: string;
}

interface ProductCardProps {
  product: Product;
  removable?: boolean;
  onRemove?: (product: Product) => void;
  onAddToBag?: (product: Product) => void | Promise<void>;
  onToggleWishlist?: (product: Product) => void | Promise<void>;
}

export default function ProductCard({
  product,
  removable = false,
  onRemove,
  onAddToBag,
  onToggleWishlist,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(product.isWishlisted ?? false);
  const router = useRouter();

  const handleCardClick = () => {
    if (product?.slug) {
      router.push(`/products/${product.slug}`);
    } else {
      console.warn("⚠️ Product slug is missing:", product);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted(false);
    onRemove?.(product);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlisted((prev) => !prev);
    await onToggleWishlist?.(product);
  };

  const handleAddToBag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onAddToBag?.(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1 relative pointer-events-none"
    >
      {/*  Remove from wishlist icon */}
      {removable && (
        <button
          onClick={handleRemove}
          className="absolute top-3 right-3 z-20 p-1.5 rounded-full border border-[var(--brand-secondary)] bg-[var(--white)] hover:opacity-90 transition pointer-events-auto"
        >
          <Heart size={16} className="text-[var(--brand-primary)]" fill="currentColor" />
        </button>
      )}

      {/* New Badge */}
      {product.isNew && (
        <span className="absolute top-3 left-3 z-20 bg-[var(--brand-primary)] text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wide pointer-events-none">
          New In
        </span>
      )}

      {/*  Wishlist toggle */}
      {!removable && (
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-3 right-3 z-20 p-1.5 rounded-full border pointer-events-auto transition ${wishlisted
              ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]"
              : "bg-white text-[var(--text-muted)] border-[var(--soft-gray)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)]"
            }`}
        >
          <Heart size={16} fill={wishlisted ? "white" : "none"} />
        </button>
      )}

      {/*  Product Image */}
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

      {/*  Product Title */}
      <h3
        onClick={handleCardClick}
        className="mt-4 text-sm font-medium text-[var(--text-primary)] line-clamp-1 pointer-events-auto"
      >
        {product.title}
      </h3>

      {/*  Price */}
      <p
        onClick={handleCardClick}
        className="mt-1 text-[var(--brand-primary)] text-sm font-semibold pointer-events-auto"
      >
        £{product.price}
      </p>

      {/* Add to Bag */}
      <button
        // onClick={handleAddToBag}
        onClick={handleCardClick}
        className="mt-3 flex items-center justify-center gap-1 text-xs font-medium border border-[var(--brand-secondary)] text-[var(--brand-secondary)] rounded-full py-2 hover:bg-[var(--brand-secondary)] hover:text-white transition pointer-events-auto"
      >
        <ShoppingBag size={14} />
        Add to Bag
      </button>
    </div>
  );
}
