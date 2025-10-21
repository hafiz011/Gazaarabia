"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Star } from "lucide-react";
import HowWeDoIt from "@/components/HowWeDoIt";
import ProductSuggestions from "@/components/ProductSuggestions";

export default function ProductDetails() {
    const productData = {
        id: 1,
        slug: "classic-mens-leather-jacket",
        title: "Classic Men's Leather Jacket",
        price: "4,999",
        images: [
            "/images/shop/img1-1.jpg",
            "/images/shop/img1-2.jpg",
            "/images/shop/img1-3.jpg",
            "/images/shop/img1-4.jpg",
        ],
        colors: [
            { name: "Brown", hex: "#BFA6A0" },
            { name: "White", hex: "#FFFFFF" },
            { name: "Black", hex: "#000000" },
            { name: "Red", hex: "#E82C3F" },
            { name: "Green", hex: "#009639" },
        ],
        sizes: ["S", "M", "L", "XL", "XXL"],
        description:
            "A timeless leather jacket designed with premium quality material for a sleek and durable finish. Perfect for both casual and formal occasions.",
        fabric:
            "100% genuine leather with a soft polyester inner lining. Regular fit with a modern silhouette.",
        details:
            "• Long sleeves with zip cuffs\n• Stand collar with snap button\n• Front zip fastening\n• Two side pockets and one chest pocket\n• Lightweight yet warm",
        returns:
            "Free standard delivery on orders over ₹999. Easy 14-day return or exchange. Items must be unworn with original tags attached.",
        highlights: [
            "Premium genuine leather",
            "Regular fit with a modern silhouette",
            "Durable zip closure with high-quality hardware",
            "Soft polyester lining for comfort",
            "Available in 5 classic colors",
        ],
        reviews: [
            {
                name: "Rahul Sharma",
                rating: 5,
                comment:
                    "Excellent quality and fits perfectly! Looks even better in real. Worth the price.",
                date: "15 Oct 2025",
            },
            {
                name: "Amit Verma",
                rating: 4,
                comment:
                    "Very comfortable and stylish. I loved the packaging too. Recommended.",
                date: "13 Oct 2025",
            },
            {
                name: "Sandeep K",
                rating: 3,
                comment:
                    "Good product but delivery was delayed. Material is good though.",
                date: "10 Oct 2025",
            },
        ],
    };

    const [product, setProduct] = useState<any>(null);
    const [wishlist, setWishlist] = useState(false);
    const [activeThumb, setActiveThumb] = useState<number>(0);
    const [selectedColor, setSelectedColor] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState<string>("");

    // Zoom
    const [zoomVisible, setZoomVisible] = useState(false);
    const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setProduct(productData);
        setSelectedColor(productData.colors[0]);
        setSelectedSize(productData.sizes[0]);
    }, []);

    // 🧠 Save to Recently Viewed (localStorage)
    useEffect(() => {
        if (!product) return;
        try {
            const key = "recentlyViewed";
            const current = {
                id: product.id,
                slug: product.slug ?? String(product.id),
                title: product.title,
                price: product.price,
                img: product.images?.[0],
            };

            const raw = localStorage.getItem(key);
            const list: any[] = raw ? JSON.parse(raw) : [];

            // remove if exists, then add to front
            const filtered = list.filter((p) => p.id !== current.id);
            const next = [current, ...filtered].slice(0, 12); // keep max 12

            localStorage.setItem(key, JSON.stringify(next));
        } catch {
            // localStorage not available (SSR / private mode) - safely ignore
        }
    }, [product]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = imgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBackgroundPosition(`${x}% ${y}%`);
    };

    if (!product) return null;

    const totalReviews = product.reviews.length;
    const avgRating =
        totalReviews > 0
            ? (
                product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) /
                totalReviews
            ).toFixed(1)
            : 0;

    return (
        <>
            {/* 🌟 TOP SECTION */}
            <section className="max-w-[1600px] mx-auto px-2 md:px-4 lg:px-6 pt-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 bg-[var(--background)]">
                {/* 🖼️ IMAGES */}
                <div className="relative flex gap-4 items-start h-[700px]">
                    {/* thumbs */}
                    <div className="hidden md:flex flex-col gap-3 w-20 overflow-y-auto h-full">
                        {product.images.map((img: string, index: number) => (
                            <button
                                type="button"
                                key={index}
                                onClick={() => setActiveThumb(index)}
                                className={`relative w-full aspect-[3/4] overflow-hidden rounded-lg border-2 transition ${activeThumb === index
                                    ? "border-[var(--brand-primary)]"
                                    : "border-gray-200 hover:border-[var(--brand-primary)]"
                                    }`}
                            >
                                <img
                                    src={img}
                                    alt={`thumb-${index}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>

                    {/* main */}
                    <div
                        ref={imgRef}
                        className="relative flex-1 rounded-2xl overflow-hidden bg-gray-100 h-full group cursor-zoom-in"
                        onMouseEnter={() => setZoomVisible(true)}
                        onMouseLeave={() => setZoomVisible(false)}
                        onMouseMove={handleMouseMove}
                    >
                        <img
                            src={product.images[activeThumb || 0]}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>

                    {/* zoom */}
                    {zoomVisible && (
                        <div
                            className="hidden lg:block absolute top-0 left-[calc(100%+20px)] w-[700px] h-[750px] rounded-xl border shadow-lg bg-white bg-no-repeat bg-cover z-10"
                            style={{
                                backgroundImage: `url(${product.images[activeThumb || 0]})`,
                                backgroundPosition,
                                backgroundSize: "350%",
                            }}
                        />
                    )}
                </div>

                {/* 🛍️ INFO */}
                <div className="flex flex-col justify-start text-left">
                    <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text-primary)] mb-2">
                        {product.title}
                    </h1>
                    <p className="text-lg font-medium text-[var(--brand-primary)] mb-4">
                        ₹{product.price}
                    </p>

                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-6">
                        {product.description}
                    </p>

                    {/* colors */}
                    {selectedColor && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">
                                Colour: {selectedColor.name}
                            </h4>
                            <div className="flex gap-2">
                                {product.colors.map((c: any, i: any) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedColor(c)}
                                        className={`w-8 h-8 rounded-full border-2 ${selectedColor.hex === c.hex
                                            ? "border-[var(--brand-primary)]"
                                            : "border-gray-300"
                                            }`}
                                        style={{ backgroundColor: c.hex }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* sizes */}
                    {selectedSize && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium mb-2">Select Size</h4>
                            <div className="flex flex-wrap gap-2">
                                {product.sizes.map((s: string, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedSize(s)}
                                        className={`px-4 py-2 text-sm rounded border transition ${selectedSize === s
                                            ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-white"
                                            : "border-gray-300 hover:border-[var(--brand-primary)]"
                                            }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* buttons */}
                    <div className="flex gap-4 mb-8">
                        <button className="flex-1 py-3 bg-[var(--brand-primary)] text-white font-semibold rounded hover:opacity-90 transition">
                            ADD TO BAG
                        </button>
                        <button
                            onClick={() => setWishlist(!wishlist)}
                            className="p-3 border rounded hover:border-[var(--brand-secondary)] transition"
                        >
                            <Heart
                                className={`transition ${wishlist
                                    ? "fill-[var(--brand-secondary)] text-[var(--brand-secondary)]"
                                    : "text-[var(--text-primary)]"
                                    }`}
                                size={20}
                            />
                        </button>
                    </div>

                    {/* accordion */}
                    <div className="border-t divide-y">
                        {[
                            { title: "Fabric & Fit", content: product.fabric },
                            { title: "Description & Details", content: product.details },
                            { title: "Delivery & Returns", content: product.returns },
                        ].map((section, i) => (
                            <details key={i} className="py-4">
                                <summary className="cursor-pointer font-medium text-[var(--text-primary)]">
                                    {section.title}
                                </summary>
                                <p className="text-[var(--text-secondary)] text-sm mt-2 whitespace-pre-line">
                                    {section.content}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🌟 HIGHLIGHTS */}
            <section className="max-w-[1200px] mx-auto px-4 py-12 border-t border-t-[var(--brand-secondary)]">
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                    Product Highlights
                </h2>
                <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2">
                    {product.highlights.map((point: string, index: number) => (
                        <li key={index}>{point}</li>
                    ))}
                </ul>
            </section>

            {/* ⭐ REVIEWS */}
            <section className="max-w-[1200px] mx-auto px-4 py-12 border-t">
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-primary)]">
                    Customer Reviews & Ratings
                </h2>

                <div className="flex items-center gap-4 mb-8">
                    <div className="text-4xl font-bold text-[var(--brand-primary)]">
                        {avgRating}
                    </div>
                    <div>
                        <div className="flex gap-1 mb-1">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    className={
                                        i < Math.floor(Number(avgRating))
                                            ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                                            : "text-gray-300"
                                    }
                                />
                            ))}
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Based on {totalReviews} reviews
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {product.reviews.map((review: any, index: number) => (
                        <div
                            key={index}
                            className="border rounded-lg p-4 shadow-sm bg-white flex flex-col gap-2"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-medium text-[var(--text-primary)]">
                                    {review.name}
                                </h4>
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {review.date}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        className={
                                            i < review.rating
                                                ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                                                : "text-gray-300"
                                        }
                                    />
                                ))}
                            </div>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🧭 Tabs: Wear With & Recently Viewed */}
            <ProductSuggestions />

            {/* 🧭 BRAND SECTION */}
            <HowWeDoIt />
        </>
    );
}
