"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "@/components/ProductCard";

export default function ProductSection({ products, title }: { products: any[], title: string }) {
    return (
        <section className="w-full bg-white py-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
                {title}
            </h2>

            <Swiper
                modules={[Navigation]}
                slidesPerView={2}
                spaceBetween={30}
                breakpoints={{
                    640: { slidesPerView: 3, spaceBetween: 35 },
                    1024: { slidesPerView: 5, spaceBetween: 40 },
                }}
                navigation
                className="px-6"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id} className="!m-0 px-3">
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
