"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useEffect, useState } from "react";

interface HeroSlide {
    desktop: string;
    mobile: string;
}

interface HeroSliderProps {
    heroSlides: HeroSlide[];
}

export default function HeroSlider({ heroSlides }: HeroSliderProps) {
    const [isMobile, setIsMobile] = useState(false);

    // Detect screen width (client-side)
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize(); // run once
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        // <section className="relative w-full h-[100vh] overflow-hidden -mt-[120px]">
        <section className="relative w-full h-[100vh] overflow-hidden -mt-[80px]">
            <Swiper
                modules={[Autoplay, Pagination, EffectFade]}
                effect="fade"
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                loop
                className="h-full w-full"
            >
                {heroSlides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div className="relative w-full h-[100vh]">
                            <Image
                                src={isMobile ? slide.mobile : slide.desktop}
                                alt={`Hero Slide ${index + 1}`}
                                fill
                                priority
                                className="object-cover object-center w-full h-full"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}
