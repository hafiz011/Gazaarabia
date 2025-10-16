"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

type CardItem = {
    id?: number | string;
    slug?: string;
    img: string;
    title: string;
    price: string;
    colors?: string[];
    isNew?: boolean;
};

const WEAR_WITH: CardItem[] = [
    { img: "/images/shop/img2-1.jpg", title: "Hooded Abaya Black", price: "₹5,499", colors: ["#000000", "#E82C3F", "#009639", "#FFFFFF", "#BFA6A0"], isNew: true },
    { img: "/images/shop/img2-2.jpg", title: "Mara Coat Black", price: "₹4,999", colors: ["#000000", "#BFA6A0"] },
    { img: "/images/shop/img2-3.jpg", title: "Black Jersey Hijab", price: "₹799", colors: ["#000000", "#FFFFFF"] },
    { img: "/images/shop/img2-4.jpg", title: "Crossover Hijab Cap", price: "₹699", colors: ["#000000", "#E82C3F"] },
    { img: "/images/shop/img2-3.jpg", title: "Black Jersey Hijab", price: "₹799", colors: ["#000000", "#FFFFFF"] },
    { img: "/images/shop/img2-4.jpg", title: "Crossover Hijab Cap", price: "₹699", colors: ["#000000", "#E82C3F"] },
    { img: "/images/shop/img2-3.jpg", title: "Black Jersey Hijab", price: "₹799", colors: ["#000000", "#FFFFFF"] },
    { img: "/images/shop/img2-4.jpg", title: "Crossover Hijab Cap", price: "₹699", colors: ["#000000", "#E82C3F"] },
    { img: "/images/shop/img2-3.jpg", title: "Black Jersey Hijab", price: "₹799", colors: ["#000000", "#FFFFFF"] },
    { img: "/images/shop/img2-4.jpg", title: "Crossover Hijab Cap", price: "₹699", colors: ["#000000", "#E82C3F"] },


];

export default function ProductSuggestions() {
    const [activeTab, setActiveTab] = useState<"wear" | "recent">("wear");
    const [recent, setRecent] = useState<CardItem[]>([]);
    const [wishlist, setWishlist] = useState<(string | number)[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem("recentlyViewed");
            const list: CardItem[] = raw ? JSON.parse(raw) : [];
            setRecent(list);
        } catch {
            setRecent([]);
        }
    }, []);

    const tabs = [
        { key: "wear", label: "Wear With" },
        { key: "recent", label: "Recently Viewed" },
    ] as const;

    const data = activeTab === "wear" ? WEAR_WITH : recent;

    const toggleWishlist = (id: string | number | undefined) => {
        if (!id) return;
        setWishlist((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    return (
        <section className="max-w-[1600px] mx-auto px-4 py-16 border-t">
            {/* 🧭 Tabs Centered — No border line */}
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

            {/* 🛍️ Carousel */}
            {data && data.length > 0 ? (
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={24}
                    //    navigation
                    slidesPerView={2}
                    breakpoints={{
                        640: { slidesPerView: 2.5 },
                        1024: { slidesPerView: 4 },
                        1440: { slidesPerView: 5 },
                    }}
                    className="mt-12"
                >
                    {data.map((item, i) => {
                        const maxVisibleColors = 4;
                        const colors = item.colors || [];
                        const extraColors = colors.length - maxVisibleColors;

                        return (
                            <SwiperSlide key={i} className="pb-4">
                                <div className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                                    {/* 🖼️ Image */}
                                    <div className="relative w-full aspect-[3/4] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[var(--brand-secondary)]">
                                        <img
                                            src={item.img}
                                            alt={item.title}
                                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* 🆕 New In */}
                                        {item.isNew && (
                                            <span className="absolute top-3 left-3 bg-[var(--brand-secondary)] text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                                                New In
                                            </span>
                                        )}

                                        {/* ❤️ Wishlist */}
                                        <button
                                            onClick={() => toggleWishlist(item.id ?? i)}
                                            className="absolute top-3 right-3 p-1 rounded-full bg-white/80 hover:bg-white shadow-sm"
                                        >
                                            <Heart
                                                size={18}
                                                className={`transition ${wishlist.includes(item.id ?? i)
                                                    ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                                                    : "text-[var(--text-primary)]"
                                                    }`}
                                            />
                                        </button>
                                    </div>

                                    {/* 🏷️ Title */}
                                    <h3 className="mt-4 text-sm font-medium text-[var(--text-primary)] line-clamp-2">
                                        {item.title}
                                    </h3>

                                    {/* 💰 Price */}
                                    <p className="mt-1 text-[var(--brand-primary)] text-sm font-semibold">
                                        {item.price}
                                    </p>

                                    {/* 🎨 Colors */}
                                    {colors.length > 0 && (
                                        <div className="flex justify-center gap-2 mt-2">
                                            {colors.slice(0, maxVisibleColors).map((color, index) => (
                                                <span
                                                    key={index}
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: color }}
                                                ></span>
                                            ))}
                                            {extraColors > 0 && (
                                                <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center justify-center w-5 h-5 border rounded-full bg-[var(--soft-gray)]">
                                                    +{extraColors}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* 🛒 CTA */}
                                    <button className="mt-3 text-xs font-medium border border-[var(--brand-secondary)] text-[var(--brand-secondary)] rounded-full py-2 hover:bg-[var(--brand-secondary)] hover:text-white transition">
                                        Add to Bag
                                    </button>
                                </div>
                            </SwiperSlide>
                        );
                    })}
                </Swiper>
            ) : (
                <div className="mt-10 bg-[var(--soft-gray)] rounded-xl p-8 text-center">
                    <p className="text-[var(--text-secondary)]">
                        You haven’t viewed any products yet. Explore our catalogue to see them here.
                    </p>
                </div>
            )}

        </section>

    )
}
