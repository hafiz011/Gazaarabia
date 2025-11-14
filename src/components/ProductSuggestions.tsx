"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import { wishlistService } from "@/lib/services/front-end/wishlistService";
import SingleImgMultiColorProductCard, { Product } from "./SingleImgMultiColorsProductCard";

interface ProductSuggestionsProps {
  wearWith?: any[];
  recentlyViewed?: Product[];
}

export default function ProductSuggestions({
  wearWith = [],
  recentlyViewed = [],
}: ProductSuggestionsProps) {
  const [activeTab, setActiveTab] = useState<"wear" | "recent">("wear");
  const [recent, setRecent] = useState<Product[]>([]);
  const [wearWithProducts, setWearWithProducts] = useState<any[]>(wearWith);
  const { data: session } = useSession();
  const router = useRouter();

  const token = session?.user?.token || null;

  //  Memoize prop to prevent re-renders
  const memoizedRecentlyViewed = useMemo(
    () => recentlyViewed || [],
    [JSON.stringify(recentlyViewed)]
  );

  //  Load recently viewed safely (client only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (memoizedRecentlyViewed.length > 0) {
        setRecent((prev) => {
          const prevIds = prev.map((p) => p.id).join(",");
          const newIds = memoizedRecentlyViewed.map((p) => p.id).join(",");
          return prevIds === newIds ? prev : memoizedRecentlyViewed;
        });
      } else {
        const raw = localStorage.getItem("recentlyViewed");
        const list: Product[] = raw ? JSON.parse(raw) : [];
        setRecent(list);
      }
    } catch (error) {
      console.error("Failed to load recently viewed:", error);
      setRecent([]);
    }
  }, [memoizedRecentlyViewed]);

  const tabs = [
    { key: "wear", label: "Wear With" },
    // { key: "recent", label: "Recently Viewed" },
  ] as const;

  const data = activeTab === "wear" ? wearWithProducts : recent;

  //  Add to Bag
  const handleAddToBag = (product: Product) => {
    console.log(" Added to bag:", product.title);
  };

  //  Wishlist toggle (uses product.isInWishlist instead of wishlist state)
  const handleWishlistToggle = async (product: Product) => {
    const productId = Number(product.id);
    const currentState = product.isInWishlist ?? product.isInWishlist ?? false;

    // Optimistic UI update
    setWearWithProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isInWishlist: !currentState } : p
      )
    );

    if (token) {
      try {
        if (currentState) {
          await wishlistService.remove(token, productId);
        } else {
          await wishlistService.add(token, productId);
        }
      } catch (error) {
        console.error("Wishlist API failed:", error);
        // Revert on failure
        setWearWithProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isInWishlist: currentState } : p
          )
        );
      }
    }

  };

  return (
    <section className="mx-auto px-4 py-16 border-t relative overflow-hidden">
      {/*  Tabs */}
      <div className="flex justify-center items-center gap-8 pb-2">
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`relative px-2 pb-3 text-lg font-semibold transition ${isActive
                ? "text-[var(--brand-primary)]"
                : "text-[var(--text-primary)] hover:text-[var(--brand-secondary)]"
                }`}
            >
              {t.label}
              <span
                className={`absolute left-0 -bottom-[2px] h-[3px] rounded-full transition-all ${isActive
                  ? "w-full bg-[var(--brand-primary)]"
                  : "w-0 bg-[var(--brand-secondary)] group-hover:w-full"
                  }`}
              />
            </button>
          );
        })}
      </div>

      {/* Product Carousel */}
      <div className="max-w-[1600px] mx-auto relative overflow-hidden">
        {data && data.length > 0 ? (
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={2}
            breakpoints={{
              640: { slidesPerView: 2.5 },
              1024: { slidesPerView: 4 },
              1440: { slidesPerView: 5 },
            }}
            className="mt-12 overflow-visible"
          >
            {data.map((item, i) => {
              const firstImage =
                item?.productimage?.[0]?.url || "/images/placeholder.jpg";

              return (
                <SwiperSlide key={item.id || i} className="pb-4 overflow-visible">
                  <div className="relative z-0 hover:z-20 overflow-visible">
                    <SingleImgMultiColorProductCard
                      product={{
                        id: item.id,
                        title: item.title,
                        price: String(item.sellingPrice || item.price || 0),
                        img: firstImage,
                        colors: item?.productvariant
                          ?.map((v: any) => v.color?.hexCode)
                          .filter(Boolean),
                        isInWishlist: item.isInWishlist ?? false,
                        slug: item.slug,
                      }}
                      onAddToBag={handleAddToBag}
                      // onWishlistChange={() => handleWishlistToggle(item)} //  match your component’s type
                      onWishlistToggle={() => handleWishlistToggle(item)}
                    />

                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No products to display.
          </div>
        )}
      </div>
    </section>
  );
}
