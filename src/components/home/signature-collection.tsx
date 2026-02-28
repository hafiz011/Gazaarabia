"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { useRouter } from "next/navigation";

interface Product {
  id: number,
  title: string,
  slug: string,
  sellingPrice: number,
  productimage: any,
}

interface SignatureProductsProps {
  products: Product[];
}


export default function SignatureCollection({ products }: SignatureProductsProps) {
  const router = useRouter();

  const handleCardClick = (item: any) => {
    if (item?.slug) {
      router.push(`/products/${item.slug}`);
    } else {
      console.warn("⚠️ Item slug is missing:", item);
    }
  };


  return (
    <section className="bg-[#ffffff] pt-8 pb-16 md:pt-10 md:pb-20 overflow-hidden">
      <div className="max-w-[1500px] mx-auto px-4 md:px-10 text-center overflow-hidden">
        {/* Section Heading */}
        <div className="mb-10">
          <h2 className="text-[1.9rem] md:text-[2.4rem] font-semibold tracking-tight text-[var(--text-primary)]">
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Signature Collection
            </span>
          </h2>
          <div className="w-20 h-[3px] bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] mx-auto mt-3 mb-5 rounded-full"></div>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Discover our handpicked selection of elegant, timeless pieces that define modest luxury.
          </p>
        </div>

        {/* Swiper Slider */}
        <div className="overflow-hidden w-full">
          <Swiper
            grabCursor={true}
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            spaceBetween={5}
            slidesPerView={2.1} //Minimum 2 visible on mobile
            loop={true}
            // breakpoints={{
            //   480: { slidesPerView: 2 },
            //   768: { slidesPerView: 3 },
            //   1024: { slidesPerView: 4 },
            //   1400: { slidesPerView: 5 },
            // }}
            breakpoints={{
              480: { slidesPerView: 2.1 },
              640: { slidesPerView: 2.4 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1400: { slidesPerView: 5 },
            }}
            speed={800}
            className="!overflow-visible w-full"
          >
            {products.map((p, i) => (
              // <SwiperSlide key={i} className="!w-[260px] sm:!w-[280px] md:!w-[300px]" onClick={() => { handleCardClick(p) }}>

              <SwiperSlide key={i} onClick={() => handleCardClick(p)}>
                <motion.div
                  className="overflow-hidden rounded-2xl bg-[#F8F8F8] group shadow-sm hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-700"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  {/* Image */}
                  {/* <div className="overflow-hidden aspect-[3/4]">
                    <Image
                      src={p.productimage?.[0]?.url}
                      alt={p.title}
                      width={400}
                      height={500}
                      className="object-cover w-full h-[420px] md:h-[450px] transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                    />
                  </div> */}
                  <div className="relative w-full aspect-[3/4] overflow-hidden">
                    <Image
                      src={p.productimage?.[0]?.url}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-105"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-5 text-center">
                    <h3 className="font-medium text-[var(--text-primary)] text-base md:text-lg mb-1 group-hover:text-[var(--brand-secondary)] transition-colors duration-300 line-clamp-2 min-h-[48px]">
                      {p.title}
                    </h3>

                    <p className="text-[var(--brand-primary)] font-semibold text-sm md:text-base">
                      £{p.sellingPrice}
                    </p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
