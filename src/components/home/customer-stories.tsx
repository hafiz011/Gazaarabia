"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star, StarHalf, StarOff } from "lucide-react";
import { motion } from "framer-motion";

// const reviews = [
//   {
//     name: "Amina",
//     text: "Absolutely love the quality and modest designs! Every piece feels premium and well-made.",
//     rating: 4.5,
//     date: "2025-09-15T10:00:00Z",
//   },
//   {
//     name: "Fatima",
//     text: "Elegant and beautifully made. The packaging was just as thoughtful as the design.",
//     rating: 5,
//     date: "2025-10-10T12:30:00Z",
//   },
//   {
//     name: "Layla",
//     text: "Fast delivery and stunning presentation. Will definitely shop again.",
//     rating: 4,
//     date: "2025-10-14T09:00:00Z",
//   },
//   {
//     name: "Zahra",
//     text: "Comfort meets luxury — absolutely adore the fabrics and fit.",
//     rating: 5,
//     date: "2025-09-25T16:45:00Z",
//   },
//   {
//     name: "Fatima",
//     text: "Elegant and beautifully made. The packaging was just as thoughtful as the design.",
//     rating: 5,
//     date: "2025-10-10T12:30:00Z",
//   },
//   {
//     name: "Layla",
//     text: "Fast delivery and stunning presentation. Will definitely shop again.",
//     rating: 4,
//     date: "2025-10-14T09:00:00Z",
//   },
//   {
//     name: "Zahra",
//     text: "Comfort meets luxury — absolutely adore the fabrics and fit.",
//     rating: 5,
//     date: "2025-09-25T16:45:00Z",
//   },
// ];


interface Review {
  id: number,
  rating: number,
  comment: string,
  user: any,
  createdAt: string
}

interface ReviewsProps {
  reviews: Review[];
}


function getTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Today";
  if (diff < 2) return "Yesterday";
  if (diff < 30) return `${Math.floor(diff)} days ago`;
  return `${Math.floor(diff / 30)} months ago`;
}

export default function CustomerStories({ reviews }: ReviewsProps) {
  return (
    <section className="bg-[#FAFAFA] pt-4 pb-16 md:pt-6 md:pb-20 text-center overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        {/* Section Heading */}
        <div className="mb-8">
          <h2 className="text-[1.9rem] md:text-[2.4rem] font-semibold tracking-tight text-[var(--text-primary)]">
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Customer Stories
            </span>
          </h2>
          <div className="w-20 h-[3px] bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] mx-auto mt-2 mb-4 rounded-full"></div>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Real stories from women who embody confidence, elegance, and modesty.
          </p>
        </div>

        {/* Reviews Slider */}
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={25}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1.5 },
            1024: { slidesPerView: 2.5 },
            1400: { slidesPerView: 3 },
          }}
          className="!overflow-visible"
        >
          {reviews.map((r, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white rounded-2xl p-8 md:p-10 shadow-sm hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] transition-all duration-500 text-left"
              >
                {/* Review Text */}
                <p className="italic text-[var(--text-secondary)] leading-relaxed mb-5">
                  “{r.comment}”
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(Math.floor(r.rating))].map((_, idx) => (
                    <Star
                      key={idx}
                      size={18}
                      className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                    />
                  ))}
                  {r.rating % 1 !== 0 && (
                    <StarHalf
                      size={18}
                      className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                    />
                  )}
                  {[...Array(5 - Math.ceil(r.rating))].map((_, idx) => (
                    <StarOff key={idx} size={18} className="text-gray-300" />
                  ))}
                </div>

                {/* Author */}
                <div className="flex flex-col">
                  <span className="font-semibold text-[var(--brand-primary)] text-base">
                    — {r?.user?.name}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] mt-1">
                    {getTimeAgo(r.createdAt)}
                  </span>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
