"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";
import { shopService } from "@/lib/services/front-end/shopServices";
import { wishlistService } from "@/lib/services/front-end/wishlistService";
import * as Slider from "@radix-ui/react-slider";
import {
    ArrowUpDown,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
} from "lucide-react";

/* ================= SHOP COLLECTION PAGE ================= */

export default function ShopPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const token = session?.user?.token || null;

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sort, setSort] = useState("new");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [showSort, setShowSort] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const [price, setPrice] = useState([0, 1000]);





    /* ================= WISHLIST ================= */
    const handleWishlistToggle = async (
        productId: number,
        isInWishlist: boolean
    ) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === productId ? { ...p, isInWishlist: !isInWishlist } : p
            )
        );



    };

    return (<section className="bg-[var(--background)] min-h-screen overflow-x-hidden">
        {loading && <Loader />}

        {/* ================= HERO ================= */}
        <div className="relative w-full h-[65vh] flex items-center justify-center text-center overflow-hidden">
            <img
                src="/images/shop/hero.jpg"
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/55" />

            <div className="relative z-10 px-6 text-white">
                <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-wide mb-4">
                    Shop Collection
                </h1>
                <p className="max-w-2xl mx-auto text-white/80 text-sm md:text-lg">
                    Discover Gazaarabia’s complete collection of timeless modest
                    fashion crafted with purpose, sustainability, and elegance.
                </p>
            </div>
        </div>

        {/* ================= TOOLBAR ================= */}
        <div className="border-b border-black/10">
            <div className="max-w-[1600px] mx-auto px-4 py-4 flex justify-between uppercase tracking-wider text-sm">

                {/* SORT */}
                <button
                    onClick={() => {
                        setShowSort(!showSort);
                        setShowFilters(false);
                    }}
                    className="flex items-center gap-2"
                >
                    <ArrowUpDown size={16} />
                    Sort
                    {showSort ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {/* FILTER */}
                <button
                    onClick={() => {
                        setShowFilters(!showFilters);
                        setShowSort(false);
                    }}
                    className="flex items-center gap-2"
                >
                    <SlidersHorizontal size={16} />
                    Filters
                    {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>
        </div>

        {/* ================= SORT PANEL ================= */}
        {showSort && (
            <div className="border-b border-black/10 bg-white">
                <div className="max-w-[1600px] mx-auto px-6 py-8 flex gap-10 uppercase text-sm">
                    {[
                        { label: "New Arrivals", value: "new" },
                        { label: "Bestsellers", value: "bestseller" },
                        { label: "Price Low", value: "price_asc" },
                        { label: "Price High", value: "price_desc" },
                    ].map((item) => (
                        <label key={item.value} className="flex items-center gap-3">
                            <input
                                type="radio"
                                checked={sort === item.value}
                                onChange={() => {
                                    setSort(item.value);
                                    setShowSort(false);
                                    setCurrentPage(1);
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
            <div className="border-b border-black/10 bg-white">
                <div className="max-w-[1600px] mx-auto px-8 py-14">

                    <h4 className="uppercase tracking-[0.25em] text-xs mb-6">
                        Price Range
                    </h4>

                    {/* PRICE SLIDER */}
                    <Slider.Root
                        value={price}
                        min={0}
                        max={1000}
                        step={10}
                        onValueChange={setPrice}
                        className="relative flex items-center w-full h-5"
                    >
                        <Slider.Track className="relative h-[2px] w-full bg-black/20">
                            <Slider.Range className="absolute h-full bg-black" />
                        </Slider.Track>
                        <Slider.Thumb className="w-3 h-3 bg-black rounded-full" />
                        <Slider.Thumb className="w-3 h-3 bg-black rounded-full" />
                    </Slider.Root>

                    <div className="flex justify-between text-xs mt-3">
                        <span>£{price[0]}</span>
                        <span>£{price[1]}</span>
                    </div>
                </div>
            </div>
        )}

        {/* ================= GRID ================= */}
        <div className="max-w-[1600px] mx-auto px-3 md:px-4 py-8">

            {products.length === 0 && !loading ? (
                <NoData message="No products available." />
            ) : (
                <>
                    <div
                        className="
            grid
            grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            2xl:grid-cols-5
            gap-[6px]
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


    );
}


