"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import ProductCard, { Product } from "@/components/SimpleProductCard";

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<Product[]>([
    {
      id: 1,
      title: "Black Modal Hijab",
      img: "/images/shop/img1-1.jpg",
      price: "₹2,499",
      isNew: true,
      isWishlisted: true,
    },
    {
      id: 2,
      title: "Ice Blue Modal Hijab",
      img: "/images/shop/img1-2.jpg",
      price: "₹2,999",
      isNew: false,
      isWishlisted: true,
    },
  ]);

  const handleRemove = (product: Product) => {
    setWishlist((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleAddToBag = (product: Product) => {
    console.log("🛍️ Added to bag:", product);
  };

  const handleWishlistToggle = (product: Product) => {
    console.log("❤️ Wishlist toggled:", product);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-16">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          My Wishlist
        </h1>
        <p className="text-[var(--text-muted)] mt-2 text-sm">
          {wishlist.length} item{wishlist.length !== 1 && "s"} saved
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Heart size={50} className="text-[var(--soft-gray)] mb-4" />
          <p className="text-[var(--text-muted)] mb-6 text-center">
            Your wishlist is empty. Start adding products you love!
          </p>
          <Link
            href="/"
            className="bg-[var(--brand-primary)] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {wishlist.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
              removable
              onRemove={handleRemove}
              onAddToBag={handleAddToBag}
              onToggleWishlist={handleWishlistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
