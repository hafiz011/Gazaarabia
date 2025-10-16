"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import CategoryHeader from "@/components/CategoryHeader";
import Pagination from "@/components/Pagination";

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = React.use(params);

    const router = useRouter();
    const searchParams = useSearchParams();

    // 🔢 Product data (example)
    const products = [...Array(40)].map((_, i) => ({
        id: i + 1,
        title: `Product ${i + 1}`,
        price: "£4,999",
        label: "New IN",
        images: ["/images/shop/img1-1.jpg", "/images/shop/img1-2.jpg", "/images/shop/img1-1.jpg"],
        colors: ["#BFA6A0", "#FFFFFF", "#000000", "#E82C3F", "#009639"],
    }));

    // 📄 Pagination settings
    const itemsPerPage = 8;
    const totalPages = Math.ceil(products.length / itemsPerPage);

    // ✅ Read current page from URL or default to 1
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    const [currentPage, setCurrentPage] = useState(pageFromUrl);

    // 👇 Whenever page changes, update the URL
    useEffect(() => {
        router.push(`?page=${currentPage}`, { scroll: false });
    }, [currentPage, router]);

    // 🧮 Paginated products
    const paginatedProducts = products.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <section className="bg-[var(--background)] min-h-screen">
            <CategoryHeader
                title={slug.replace(/-/g, " ")}
                description="Our coats and cover-ups epitomise sophistication and timeless elegance..."
                categories={[
                    "All", "Abayas", "Maxi Dresses", "Kimonos", "Kaftans", "Embroideries",
                    "Prayer Outfits", "Slip Dresses", "Co-Ord Sets", "Coats & Cover Ups",
                    "Girls Abayas", "Midis & Tops", "Trousers & Skirts", "Shirt Dresses",
                    "Modest Swimwear", "Modest Activewear"
                ]}
            />

            {/* 🛍️ Product Grid */}
            <div className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 py-8">
                {/* <div
                    className="
            grid
            grid-cols-1
            sm:grid-cols-2
            md:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
            gap-x-4 gap-y-8
            justify-items-center
          "
                >
                    {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div> */}


                <div
                    className="
    grid
    grid-cols-1
    sm:grid-cols-2
    md:grid-cols-2
    lg:grid-cols-2    
    xl:grid-cols-3
    2xl:grid-cols-4
    gap-x-4 gap-y-14
    justify-items-center
  "
                >
                    {paginatedProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>



                {/* 📍 Pagination Component */}
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                />
            </div>
        </section>
    );
}
