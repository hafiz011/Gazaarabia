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
import { getAllProducts } from "@/lib/services/front-end/productService";


export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    // const { slug } = React.use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const token = session?.user?.token || null;

    const [productsData, setProductsData] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(
        Number(searchParams.get("page")) || 1
    );
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || '');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        setSearchQuery(searchParams.get("q") || "");
        setCurrentPage(Number(searchParams.get("page")) || 1);
    }, [searchParams]);


    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getAllProducts(searchQuery, false, currentPage, 4);
            setProductsData(data);
            setProducts(Array.isArray(data?.products) ? data?.products : []);
            setTotalPages(data?.totalPages);

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
    }, [searchQuery, currentPage, status, token]);


    //  Sync pagination with URL
    // useEffect(() => {
    //     router.push(`?page=${currentPage}`, { scroll: false });
    // }, [currentPage, router]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(currentPage));

        router.push(`?${params.toString()}`, { scroll: false });
    }, [currentPage]);


    //  Handle Wishlist Toggle
    const handleWishlistToggle = async (
        productId: number,
        isInWishlist: boolean
    ) => {
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
            <section className="bg-[var(--background)] min-h-[60vh]">

                {/* ===== SEARCH PAGE HEADER ===== */}
                <div className="w-full pt-16 pb-10 text-center">
                    <h1 className="text-[28px] md:text-[32px] tracking-[0.2em] uppercase text-gray-900">
                        Search Results
                    </h1>

                    {!loading && (
                        productsData?.total > 0 ? (
                            <p className="mt-3 text-sm tracking-wide text-gray-600">
                                {productsData?.total} results for <span className="italic">"{searchQuery}"</span>
                            </p>
                        ) : (
                            <p className="mt-3 text-sm tracking-wide text-gray-600 max-w-xl mx-auto">
                                No search results for <span className="italic">"{searchQuery}"</span>.<br />
                                Please try searching again using different words.
                            </p>
                        )
                    )}
                </div>


                <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 py-8 overflow-x-hidden">

                    {products.length != 0 && !loading &&
                      
                        <>
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
                        // )
                    }
                </div>
            </section>
        </>
    );
}
