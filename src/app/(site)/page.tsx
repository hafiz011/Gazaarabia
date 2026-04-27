"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
// import "swiper/css";
// import "swiper/css/pagination";
// import "swiper/css/effect-fade";

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

      {/* <HeroSlider heroSlides={heroSlides} /> */}

      {/* <ShopByCategory categories={categories} />

      {homeData?.midBanner &&
        <section className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
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

        </section>
      }

      <section id="signature-collection">
        <SignatureCollection products={products} />
      </section>

      {reviews.length > 0 && (
        <CustomerStories reviews={reviews} />
      )}


      <MoreThanFashionSection />


      <WearTheChange /> */}


      {/* Add Affiliate Section HERE */}
      {/* <BecomeAffiliateSection data={{ commission: homeData?.affiliateCommission }} /> */}

    </>
  );
}
