"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";
// @ts-ignore
import "swiper/css/effect-fade";

import { motion } from "framer-motion";
import SignatureCollection from "@/components/home/signature-collection";
import CustomerStories from "@/components/home/customer-stories";
import InfoGridSection from "@/components/home/infoGrid";
import WearTheChange from "@/components/home/wearTheChange";
import ShopByCategory from "@/components/home/shopByCategory";
import MoreThanFashionSection from "@/components/home/moreThanFashionSection";
import HeroSlider from "@/components/home/heroSlider";
import LaunchAnnouncementBanner from "@/components/home/LaunchAnnouncementBanner";
import { homePageFrontend } from "@/lib/services/front-end/homePage";
import Loader from "@/components/Loader";
import SubscribePopup from "@/components/SubscribePopup";
import BecomeAffiliateSection from "@/components/home/becomeAffiliateSection";
import TrendingNow from "@/components/home/trendingNow";
import BestSellers from "@/components/home/bestSellers";
import ShopByColor from "@/components/home/shopByColor";

export default function HomeHero() {

  const [homeData, setHomeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroSlides, setHeroSlides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [shopByColors, setShopByColors] = useState([]);

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
        // NEW sections
        if (Array.isArray(data?.trendingProducts)) {
          setTrendingProducts(data.trendingProducts)
        }
        if (Array.isArray(data?.bestSellerProducts)) {
          setBestSellerProducts(data.bestSellerProducts)
        }
        if (Array.isArray(data?.shopByColors)) {
          setShopByColors(data.shopByColors)
        }
      } catch (err) {
        console.error("Homepage fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: "smooth" });
          }, 200); // small delay ensures UI rendered
        }
      }
    }
  }, [loading]);

  if (loading || !homeData) return <Loader />;

  return (
    <>
      <SubscribePopup />

      <LaunchAnnouncementBanner />

      <HeroSlider heroSlides={heroSlides} />

      {/* Trending Now — Horizontal Carousel */}
      <TrendingNow products={trendingProducts} />

      {/* Best Sellers — Featured Grid */}
      <BestSellers products={bestSellerProducts} />

      {/* Shop by Category — Redesigned Bento Grid */}
      <ShopByCategory categories={categories} />

      {/* Mid Banner */}
      {homeData?.midBanner &&
        <section className="relative w-full h-[40vh] sm:h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
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
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>

        </section>
      }



      {/* Shop by Color — Color Swatches */}
      <ShopByColor colors={shopByColors} />

      {/* Signature Collection */}
      <section id="signature-collection">
        <SignatureCollection products={products} />
      </section>

      {reviews.length > 0 && (
        <CustomerStories reviews={reviews} />
      )}


      <MoreThanFashionSection />


      <WearTheChange />


      {/* Add Affiliate Section HERE */}
      <BecomeAffiliateSection data={{ commission: homeData?.affiliateCommission }} />

    </>
  );
}
