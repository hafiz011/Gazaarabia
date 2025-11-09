"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

import { Heart, Globe2, Users } from "lucide-react";
import { motion } from "framer-motion";
import SignatureCollection from "@/components/home/signature-collection";
import CustomerStories from "@/components/home/customer-stories";
import ViewLookbook from "@/components/home/viewLookBook";
import InfoGridSection from "@/components/home/infoGrid";
import WearTheChange from "@/components/home/wearTheChange";
import ShopByCategory from "@/components/home/shopByCategory";
import MoreThanFashionSection from "@/components/home/moreThanFashionSection";
import HeroSlider from "@/components/home/heroSlider";
import { homePageFrontend } from "@/lib/services/front-end/homePage";
import Loader from "@/components/Loader";

export default function HomeHero() {

  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await homePageFrontend.get();
        console.log('home page data:>', data)
        setHomeData(data);
        if (Array.isArray(data?.heroSlides)) {
          setHeroSlides(data?.heroSlides)
        }
        if (Array.isArray(data?.shopByCategory)) {
          setCategories(data?.shopByCategory)
        }
        if (Array.isArray(data?.signatureProducts)) {
          setProducts(data?.signatureProducts)
        }
        if (Array.isArray(data?.reviews)) {
          setReviews(data?.reviews)
        }
      } catch (err) {
        console.error("Homepage fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !homeData) return <Loader />;


  // const heroSlides = [
  //   {
  //     desktop: "/images/home/hero-desktop-1.jpg",
  //     mobile: "/images/home/hero-mobile-1.jpg",
  //   },
  //   {
  //     desktop: "/images/home/hero-desktop-2.jpg",
  //     mobile: "/images/home/hero-mobile-2.jpg",
  //   }
  // ];

  // const categories = [
  //   { src: "/images/home/category1.jpg", label: "Abayas" },
  //   { src: "/images/home/category2.jpg", label: "Coats & Coverups" },
  //   { src: "/images/home/category3.jpg", label: "Hijabs" },
  //   { src: "/images/home/category4.jpg", label: "Dresses" },
  // ];

  return (
    <>
      <HeroSlider heroSlides={heroSlides} />

      <MoreThanFashionSection />

      <ShopByCategory categories={categories} />

      {homeData?.midBanner &&
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
          {/* Full Image */}
          <motion.div
            initial={{ scale: 1.05, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={homeData?.midBanner}
              alt="Luxury Modestwear Banner"
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>

          {/* Optional Overlay (for mood & text readability) */}
          {/* <div className="absolute inset-0 bg-black/20 md:bg-black/25" /> */}

          {/* Optional Text Overlay */}
          {/* <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-white text-3xl md:text-5xl font-semibold tracking-wide mb-3"
            >
              Embrace Elegance
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-white/80 text-sm md:text-lg max-w-2xl leading-relaxed"
            >
              Discover our new season pieces that redefine modern modest fashion.
            </motion.p>
          </div> */}
        </section>
      }


      <SignatureCollection products={products} />

      {reviews.length > 0 && (
        <CustomerStories reviews={reviews} />
      )}

      {/* <ViewLookbook /> */}

      <InfoGridSection />

      <WearTheChange />

    </>
  );
}
