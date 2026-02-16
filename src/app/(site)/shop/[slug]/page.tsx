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
import { productFilterOptionsService } from "@/lib/services/front-end/productFilterOptionsService";
import * as Slider from "@radix-ui/react-slider";
import { ArrowUpDown, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";



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
  const [filterMeta, setFilterMeta] = useState<{
    colors: any[];
    sizes: any[];
    categories: any[];
    subcategories: any[];
  }>({
    colors: [],
    sizes: [],
    categories: [],
    subcategories: [],
  });

  const [price, setPrice] = useState([0, 1000]);
  const [filters, setFilters] = useState({
    availability: [] as string[], // ["in", "out"]
    sizes: [] as number[],        // size IDs
    colors: [] as number[],       // color IDs
    subcategories: [] as number[],// subcategory IDs
    priceMin: 0,
    priceMax: 1000,
  });

  const appliedFilterCount =
    filters.availability.length +
    filters.sizes.length +
    filters.colors.length +
    filters.subcategories.length +
    (filters.priceMin !== 0 || filters.priceMax !== 1000 ? 1 : 0);

  const [sort, setSort] = useState<string>("new");




  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/front-end/product-filter-options");
        const json = await res.json();

        if (json.success) {
          setFilterMeta(json.data);
        }
      } catch (err) {
        console.error("Failed to load filter meta:", err);
      }
    })();
  }, []);




  const fetchProducts = async (overrideFilters = filters) => {
    try {
      setLoading(true);
      const data: any = await shopService.getShopData(
        token || "", //  use token only if available
        slug,
        currentPage,
        20,
        {
          ...overrideFilters,
          sort,
        }
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

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      priceMin: price[0],
      priceMax: price[1],
    }));
  }, [price]);


  useEffect(() => {
    fetchProducts();
  }, [sort]);


  return (
    <>
      {loading && <Loader />}
      {/* <section className="bg-[var(--background)] min-h-screen"> */}
      <section className="bg-[var(--background)] min-h-screen overflow-x-hidden">

        <CategoryHeader
          selectedSlug={slug}
          title={slug.replace(/-/g, " ")}
          description="Our coats and cover-ups epitomise sophistication and timeless elegance..."
          parentCategory={parentCategory}
          categories={subcategories}
          onCategoryChange={(cat) => router.push(`/shop/${cat}`)}
        />

        {/* ================= SORT + FILTER BAR ================= */}
        {/* <div className="w-full border-y border-gray-200 bg-[var(--background)]"> */}

        <div className="w-full border-b border-black/10 bg-[var(--background)]">
          <div className="max-w-[1600px] mx-auto px-4 py-4 flex justify-between items-center text-sm uppercase tracking-wider">

            {/* SORT BUTTON */}
            <button
              onClick={() => {
                setShowSort(!showSort);
                setShowFilters(false);
              }}
              className="flex items-center gap-2 hover:opacity-70 transition"
            >
              <ArrowUpDown size={16} strokeWidth={1.5} />
              <span>Sort</span>
              {showSort ? (
                <span className={`transition-transform ${showSort ? "rotate-180" : ""}`}>
                  <ChevronUp size={14} className="opacity-60" />
                </span>
              ) : (
                <span className={`transition-transform ${showSort ? "rotate-180" : ""}`}>
                  <ChevronDown size={14} className="opacity-60" />
                </span>
              )}
            </button>

            {/*  Divider (desktop only) */}
            <div className="hidden md:block w-px h-4 bg-black/20 mx-6" />

            {/* FILTER BUTTON */}
            <button
              onClick={() => {
                setShowFilters(!showFilters);
                setShowSort(false);
              }}
              className="flex items-center gap-2 hover:opacity-70 transition"
            >
              <SlidersHorizontal size={16} strokeWidth={1.5} />
              <span>
                Filters{appliedFilterCount > 0 && ` (${appliedFilterCount})`}
              </span>
              {showFilters ? (
                <span className={`transition-transform ${showSort ? "rotate-180" : ""}`}>
                  <ChevronUp size={14} className="opacity-60" />
                </span>
              ) : (
                <span className={`transition-transform ${showSort ? "rotate-180" : ""}`}>
                  <ChevronDown size={14} className="opacity-60" />
                </span>
              )}
            </button>

          </div>
        </div>

        {/* ================= SORT PANEL ================= */}
        {showSort && (
          <div className="w-full bg-[var(--background)] border-b border-black/10 animate-[fadeIn_0.25s_ease]">
            <div className="max-w-[1600px] mx-auto px-6 py-8 flex flex-wrap gap-x-12 gap-y-6 text-sm uppercase tracking-wider">

              {[
                { label: "Bestsellers", value: "bestseller" },
                { label: "New Arrivals", value: "new" },
                { label: "Price - Low to High", value: "price_asc" },
                { label: "Price - High to Low", value: "price_desc" },
              ].map((item) => (
                <label
                  key={item.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="sort"
                    checked={sort === item.value}
                    onChange={() => {
                      setSort(item.value);
                      setCurrentPage(1);
                      setShowSort(false);
                    }}
                  />
                  {item.label}
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
              {/* AVAILABILITY */}
              <div>
                <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                  Availability
                </h4>
                <div className="space-y-3">
                  {["In stock", "Out of stock"].map((v) => (
                    <label
                      key={v}
                      className="flex items-center gap-3 cursor-pointer group text-gray-700 hover:text-black transition"
                    >
                      <input
                        type="checkbox"
                        checked={filters.availability.includes(v)}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            availability: e.target.checked
                              ? [...prev.availability, v]
                              : prev.availability.filter((x) => x !== v),
                          }))
                        }
                      />
                      {v}
                    </label>
                  ))}
                </div>
              </div>

              {/* PRODUCT TYPE (Categories / Subcategories) */}
              <div>
                <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                  Product Type
                </h4>
                <div className="space-y-3">
                  {filterMeta.subcategories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 cursor-pointer group text-gray-700 hover:text-black transition"
                    >
                      {/* <span className="w-4 h-4 border border-black/40 flex items-center justify-center group-hover:border-black transition"> */}
                      <input
                        type="checkbox"
                        checked={filters.subcategories.includes(cat.id)}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            subcategories: prev.subcategories.includes(cat.id)
                              ? prev.subcategories.filter((id) => id !== cat.id)
                              : [...prev.subcategories, cat.id],
                          }))
                        }
                      />

                      {/* </span> */}
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* SIZE */}
              <div>
                <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                  Size
                </h4>
                <div className="space-y-3">
                  {filterMeta.sizes.map((size) => (
                    <label
                      key={size.id}
                      className="flex items-center gap-3 cursor-pointer group text-gray-700 hover:text-black transition"
                    >
                      {/* <span className="w-4 h-4 border border-black/40 flex items-center justify-center group-hover:border-black transition"> */}
                      <input
                        type="checkbox"
                        checked={filters.sizes.includes(size.id)}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            sizes: e.target.checked
                              ? [...prev.sizes, size.id]
                              : prev.sizes.filter((id) => id !== size.id),
                          }))
                        }
                      />

                      {/* </span> */}
                      {size.name}
                    </label>
                  ))}
                </div>
              </div>

              {/* COLOUR */}
              <div>
                <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                  Colour
                </h4>
                <div className="space-y-3">
                  {filterMeta.colors.map((color) => (
                    <label
                      key={color.id}
                      className="flex items-center gap-3 cursor-pointer group text-gray-700 hover:text-black transition"
                    >

                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color.id)}
                        onChange={() =>
                          setFilters((prev) => ({
                            ...prev,
                            colors: prev.colors.includes(color.id)
                              ? prev.colors.filter((id) => id !== color.id)
                              : [...prev.colors, color.id],
                          }))
                        }
                      />

                      <span
                        className="w-4 h-4 border border-black/40 rounded-full"
                        style={{ backgroundColor: color.hexCode }}
                      />
                      {color.name}
                    </label>
                  ))}
                </div>
              </div>


              {/* PRICE */}
              <div>
                <h4 className="mb-6 text-xs uppercase tracking-[0.25em] text-gray-900">
                  Price
                </h4>

                {/* From / To inputs */}
                <div className="flex items-center gap-6 no-input-decoration">
                  {/* MIN */}
                  <div className="relative min-w-[110px]">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-black/60">
                      £
                    </span>
                    <input
                      type="number"
                      value={price[0]}
                      // onChange={(e) =>
                      //   setPrice([Math.min(+e.target.value, price[1] - 10), price[1]])
                      // }

                      onChange={(e) => {
                        const value = Math.min(+e.target.value || 0, price[1] - 10);

                        setPrice([value, price[1]]);
                        setFilters((prev) => ({
                          ...prev,
                          priceMin: value,
                        }));
                      }}


                      className="w-full border-b border-black/30 bg-transparent py-2 pl-6 pr-2 text-sm outline-none focus:border-black transition"
                    />
                  </div>

                  <span className="text-black/40">—</span>

                  {/* MAX */}
                  <div className="relative min-w-[110px]">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 text-sm text-black/60">
                      £
                    </span>
                    <input
                      type="number"
                      value={price[1]}
                      // onChange={(e) =>
                      //   setPrice([price[0], Math.max(+e.target.value, price[0] + 10)])
                      // }

                      onChange={(e) => {
                        const value = Math.max(+e.target.value || 0, price[0] + 10);

                        setPrice([price[0], value]);
                        setFilters((prev) => ({
                          ...prev,
                          priceMax: value,
                        }));
                      }}


                      className="w-full border-b border-black/30 bg-transparent py-2 pl-6 pr-2 text-sm outline-none focus:border-black transition"
                    />
                  </div>
                </div>




                {/* Slider */}
                <div className="mt-8">
                  <Slider.Root
                    value={price}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={(value) => {
                      setPrice(value);
                      setFilters((prev) => ({
                        ...prev,
                        priceMin: value[0],
                        priceMax: value[1],
                      }));
                    }}
                    className="relative flex items-center w-full h-5"
                  >

                    <Slider.Track className="relative h-[2px] w-full bg-black/20">
                      <Slider.Range className="absolute h-full bg-black" />
                    </Slider.Track>

                    <Slider.Thumb className="block w-3 h-3 bg-black rounded-full focus:outline-none" />
                    <Slider.Thumb className="block w-3 h-3 bg-black rounded-full focus:outline-none" />
                  </Slider.Root>

                  {/* Labels */}
                  <div className="relative mt-3 text-xs text-black/60 h-4">
                    <span
                      className="absolute -translate-x-1/2"
                      style={{ left: `${(price[0] / 1000) * 100}%` }}
                    >
                      £{price[0]}
                    </span>
                    <span
                      className="absolute -translate-x-1/2"
                      style={{ left: `${(price[1] / 1000) * 100}%` }}
                    >
                      £{price[1]}
                    </span>
                  </div>
                </div>
              </div>


            </div>

            {/* FOOTER */}
            <div className="max-w-[1600px] mx-auto px-8 pb-10 flex gap-10 text-xs uppercase tracking-[0.25em]">
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchProducts();
                }}
              >
                Apply{appliedFilterCount > 0 && ` (${appliedFilterCount})`}
              </button>

              <button
                onClick={() => {
                  const resetFilters = {
                    availability: [],
                    sizes: [],
                    colors: [],
                    subcategories: [],
                    priceMin: 0,
                    priceMax: 1000,
                  };

                  setFilters(resetFilters);
                  setPrice([0, 1000]);
                  setCurrentPage(1);
                  fetchProducts(resetFilters);
                }}
              >
                Reset filters
              </button>

            </div>

          </div>
        )}


        {/* <div className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 py-8"> */}

        {/* <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 overflow-x-hidden"> */}
        {/* <div className="w-full max-w-[1600px] mx-auto px-2 md:px-4 py-6

 overflow-x-hidden"> */}
        <div className="w-full max-w-[1600px] mx-auto px-3 md:px-4 py-6 overflow-x-hidden">

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


              {/* <div
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
    gap-[6px]
    w-full
    min-w-0
  "
              >



                {/* {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onWishlistToggle={handleWishlistToggle}
                  />
                ))} */}

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
