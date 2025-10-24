"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/CategoryHeader";
import Pagination from "@/components/Pagination";
import { shopService } from "@/lib/services/front-end/shopServices";
import { wishlistService } from "@/lib/services/front-end/wishlistService";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const token = session?.user?.token || null;

  const [products, setProducts] = useState<any[]>([]);
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data: any = await shopService.getShopData(
        token || "", // 🔑 use token only if available
        slug,
        currentPage,
        6
      );
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setParentCategory(data.parentCategory);
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Only one API call after session has finished loading
  useEffect(() => {
    if (status !== "loading") {
      fetchProducts();
    }
  }, [slug, currentPage, status, token]);

  // 🧭 Sync pagination with URL
  useEffect(() => {
    router.push(`?page=${currentPage}`, { scroll: false });
  }, [currentPage, router]);

  // ❤️ Handle Wishlist Toggle
  const handleWishlistToggle = async (
    productId: number,
    isInWishlist: boolean
  ) => {
    if (!token) {
      router.push("/login");
      return;
    }

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isInWishlist: !isInWishlist } : p
      )
    );

    try {
      if (isInWishlist) {
        await wishlistService.remove(token, productId);
      } else {
        await wishlistService.add(token, productId);
      }
    } catch (error) {
      console.error("❌ Wishlist update failed:", error);
      // Revert UI on error
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isInWishlist } : p
        )
      );
    }
  };

  return (
    <>
      {loading && <Loader />}
      <section className="bg-[var(--background)] min-h-screen">
        <CategoryHeader
          selectedSlug={slug}
          title={slug.replace(/-/g, " ")}
          description="Our coats and cover-ups epitomise sophistication and timeless elegance..."
          parentCategory={parentCategory}
          categories={subcategories}
          onCategoryChange={(cat) => router.push(`/shop/${cat}`)}
        />

        <div className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 py-8">
          {products.length === 0 && !loading ? (
            <NoData message="No products found for this category." />
          ) : (
            <>
              <div
                className="
                  grid grid-cols-1
                  sm:grid-cols-2
                  md:grid-cols-2
                  lg:grid-cols-2
                  xl:grid-cols-3
                  2xl:grid-cols-4
                  gap-x-4 gap-y-14
                  justify-items-center
                "
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
