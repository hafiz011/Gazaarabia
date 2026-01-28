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

// export default function CategoryPage({ params }: { params: { slug: string } }) {
export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
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
  const [showSort, setShowSort] = useState(false);
  const [showFilters, setShowFilters] = useState(false);


  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data: any = await shopService.getShopData(
        token || "", //  use token only if available
        slug,
        currentPage,
        8
      );
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setParentCategory(data.parentCategory);
      setSubcategories(data.subcategories || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  //  Only one API call after session has finished loading
  useEffect(() => {
    if (status !== "loading") {
      fetchProducts();
    }
  }, [slug, currentPage, status, token]);

  //  Sync pagination with URL
  useEffect(() => {
    router.push(`?page=${currentPage}`, { scroll: false });
  }, [currentPage, router]);

  //  Handle Wishlist Toggle
  const handleWishlistToggle = async (
    productId: number,
    isInWishlist: boolean
  ) => {
    // if (!token) {
    //   router.push("/login");
    //   return;
    // }

    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, isInWishlist: !isInWishlist } : p
      )
    );

    if (token) {
      try {
        if (isInWishlist) {
          await wishlistService.remove(token, productId);
        } else {
          await wishlistService.add(token, productId);
        }
      } catch (error) {
        console.error("Wishlist update failed:", error);
        // Revert UI on error
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, isInWishlist } : p
          )
        );
      }
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

        {/* ================= SORT + FILTER BAR ================= */}
        <div className="w-full border-y border-gray-200 bg-[var(--background)]">
          <div className="max-w-[1600px] mx-auto px-4 py-4 flex justify-between items-center text-sm uppercase tracking-wider">

            {/* SORT BUTTON */}
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilters(false);
              }}
              className="flex items-center gap-2"
            >
              Sort by
              <span className="opacity-60">{showSort ? "—" : "+"}</span>
            </button>

            {/* FILTER BUTTON */}
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
              }}
              className="flex items-center gap-2"
            >
              Filters (2)
              <span className="opacity-60">{showFilters ? "—" : "+"}</span>
            </button>

          </div>
        </div>

        {/* ================= SORT PANEL ================= */}
        {showSort && (
          <div className="w-full bg-[var(--background)] border-b border-black/10 animate-[fadeIn_0.25s_ease]">
            <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-wrap gap-x-12 gap-y-6 text-sm uppercase tracking-wider">

              {[
                "Bestsellers",
                "New Arrivals",
                "Price - Low to High",
                "Price - High to Low",
              ].map((v) => (
                <label
                  key={v}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <span className="w-4 h-4 border border-black/40 flex items-center justify-center group-hover:border-black transition">
                    <input type="checkbox" className="hidden" />
                  </span>
                  <span className="group-hover:opacity-70 transition">{v}</span>
                </label>
              ))}

            </div>
          </div>
        )}


        {/* ================= FILTER PANEL ================= */}
        {showFilters && (
          <div className="w-full bg-[var(--background)] border-b border-black/10 animate-[fadeIn_0.25s_ease]">

            <div className="max-w-[1600px] mx-auto px-8 py-14 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-12 gap-y-14 text-sm">

              {/* FILTER BLOCK */}
              {[
                {
                  title: "Availability",
                  items: ["In stock", "Out of stock"],
                },
                {
                  title: "Product Type",
                  items: ["Abaya", "Kaftan", "Prayer Outfit", "Slip Dress"],
                },
                {
                  title: "Size",
                  items: ["XXS", "XS", "S", "M", "L", "XL", "XXL", "One Size"],
                },
                {
                  title: "Length",
                  items: ["38", "40", "42", "44", "46", "48", "50", "52", "54", "56", "58", "60", "62"],
                },
                {
                  title: "Colour",
                  items: ["Black", "Blue", "Brown", "Green", "Grey", "Multicolour", "Neutral", "Off white", "Pink", "Purple", "Red", "White"],
                },
              ].map((group) => (
                <div key={group.title}>
                  <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                    {group.title}
                  </h4>

                  <div className="space-y-3">
                    {group.items.map((v) => (
                      <label
                        key={v}
                        className="flex items-center gap-3 cursor-pointer group text-gray-700 hover:text-black transition"
                      >
                        <span className="w-4 h-4 border border-black/40 flex items-center justify-center group-hover:border-black transition">
                          <input type="checkbox" className="hidden" />
                        </span>
                        {v}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* PRICE */}
              <div>
                <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                  Price
                </h4>

                <div className="flex gap-3">
                  <input
                    placeholder="£ From"
                    className="w-full border-b border-black/30 bg-transparent py-2 text-sm outline-none focus:border-black transition"
                  />
                  <input
                    placeholder="£ To"
                    className="w-full border-b border-black/30 bg-transparent py-2 text-sm outline-none focus:border-black transition"
                  />
                </div>

                <div className="mt-6 h-[1px] bg-black/20 relative">
                  <div className="absolute left-0 top-[-5px] w-3 h-3 bg-black rounded-full"></div>
                  <div className="absolute right-0 top-[-5px] w-3 h-3 bg-black rounded-full"></div>
                </div>
              </div>

            </div>

            {/* FOOTER */}
            <div className="max-w-[1600px] mx-auto px-8 pb-10 flex gap-10 text-xs uppercase tracking-[0.25em]">
              <button className="border-b border-black hover:opacity-60 transition">
                Apply (2)
              </button>
              <button className="text-black/50 hover:text-black transition">
                Reset filters
              </button>
            </div>

          </div>
        )}


        {/* <div className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 py-8"> */}

        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 overflow-x-hidden">

          {products.length === 0 && !loading ? (
            <NoData message="No products found for this category." />
          ) : (
            <>
              {/* <div
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
              > */}


              <div
                className="
    grid 
    grid-cols-2
    sm:grid-cols-2
    md:grid-cols-3
    lg:grid-cols-3
    xl:grid-cols-4
    2xl:grid-cols-5
    gap-x-3 gap-y-10
    justify-items-stretch
    w-full
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
