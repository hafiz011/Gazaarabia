"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/CategoryHeader";
import Pagination from "@/components/Pagination";
import { shopService } from "@/lib/services/front-end/shopServices";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";  // 👈 import here

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [parentCategory, setParentCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [loading, setLoading] = useState<boolean>(true);

  // 🛍️ Fetch products API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data: any = await shopService.getShopData(slug, currentPage, 6);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setParentCategory(data.parentCategory)
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error("❌ Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Re-fetch on page or slug change
  useEffect(() => {
    fetchProducts();
  }, [slug, currentPage, selectedCategory]);

  // 🧭 Sync current page with URL
  useEffect(() => {
    router.push(`?page=${currentPage}`, { scroll: false });
  }, [currentPage, router]);

  return (
    <>
      {loading && <Loader />}

      <section className="bg-[var(--background)] min-h-screen">
        <CategoryHeader
          selectedSlug={slug}
          title={slug.replace(/-/g, " ")}
          description="Our coats and cover-ups epitomise sophistication and timeless elegance..."
          parentCategory = {parentCategory}
          categories={subcategories}
          onCategoryChange={(cat) => {
            router.push(`/shop/${cat}`);
          }}
        />

        <div className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 py-8">
          {/* ✅ Show NoData if products array is empty */}
          {products.length === 0 && !loading ? (
            <NoData message="No products found for this category." />
          ) : (
            <>
              {/* Product Grid */}
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
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
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
