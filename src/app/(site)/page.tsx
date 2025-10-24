"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Plus, X } from "lucide-react"
import { Star, StarHalf, StarOff, Heart } from "lucide-react";
import { getTimeAgo } from "@/lib/utils";


const videoSources = [
  "/videos/home/video1.mp4",
  "/videos/home/video2.mp4",
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [averageRating, setAverageRating] = useState(4.5);
  const [totalReviews, setTotalReviews] = useState(15);

  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([1, 2]);

  const products = [
    {
      src: "/images/home/coat1.jpg",
      name: "Cape Cover Up Camel",
      price: "£55.00",
      colors: ["#C19A6B", "#000000", "#FFFFFF"],
      label: "New in"
    },
    {
      src: "/images/home/coat2.jpg",
      name: "Utility Jacket Mink",
      price: "£49.00",
      colors: ["#BFA6A0", "#9CA3AF"],
      label: "New in"
    },
    {
      src: "/images/home/coat3.jpg",
      name: "Tote Jacket Black",
      price: "£49.00",
      colors: ["#000000", "#C19A6B", "#A7C7E7", "#FFFFFF"],
      label: "New in"
    },
    {
      src: "/images/home/coat4.jpg",
      name: "Boucle Manto Camel",
      price: "£60.00",
      colors: ["#C19A6B", "#FFFFFF"],
      label: "New in"
    },
    {
      src: "/images/home/coat5.jpg",
      name: "Longline Gilet Grey",
      price: "£59.00",
      colors: ["#9CA3AF", "#000000"],
      label: "New in"
    },
    {
      src: "/images/home/coat1.jpg",
      name: "Lapel Coat Mink",
      price: "£65.00",
      colors: ["#BFA6A0", "#FFFFFF", "#000000"],
      label: "New in"
    },
    {
      src: "/images/home/coat2.jpg",
      name: "Mara Coat Camel",
      price: "£79.00",
      colors: ["#C19A6B", "#000000"],
      label: "New in"
    },
    {
      src: "/images/home/coat3.jpg",
      name: "Boucle Manto Baby Blue",
      price: "£60.00",
      colors: ["#A7C7E7", "#FFFFFF", "#000000", "#C19A6B"],
      label: "New in"
    },
  ];

  const reviewsList = [
    { name: "Amina", text: "Absolutely love the quality and modest designs! Absolutely love the quality and modest designs! Absolutely love the quality and modest designs!", rating: 3.5, date: "2025-09-15T10:00:00Z" },
    { name: "Fatima", text: "The coat I ordered is elegant and beautifully made.", rating: 5, date: "2025-10-10T12:30:00Z" },
    { name: "Layla", text: "Fast delivery and stunning packaging. Highly recommend!", rating: 4, date: "2025-10-14T09:00:00Z" },
    { name: "Huda", text: "Such beautiful fabric and detailing, exceeded expectations!", rating: 5, date: "2025-09-28T18:00:00Z" },
    { name: "Sara", text: "I got so many compliments on my outfit!", rating: 4.5, date: "2025-10-13T15:00:00Z" },
  ];

  const categories = [
    { src: "/images/home/category1.jpg", label: "Abayas" },
    { src: "/images/home/category2.jpg", label: "Coats & Coverups" },
    { src: "/images/home/category3.jpg", label: "Hijabs" },
    { src: "/images/home/category4.jpg", label: "Dresses" },
    // { src: "/images/home/category1.jpg", label: "Jilbabs" },
    // { src: "/images/home/category2.jpg", label: "Prayer Sets" },
    // { src: "/images/home/category3.jpg", label: "Accessories" },
    // { src: "/images/home/category4.jpg", label: "New Arrivals" },
  ];


  const openModal = (review: any) => {
    setSelectedReview(review);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedReview(null);
  };



  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % videoSources.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);


  const toggleWishlist = (index: number) => {
    setWishlist((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    // <main className="min-h-screen w-full">
    <main className="min-h-screen w-full relative overflow-visible">

      {/* ========================= Hero Slider ========================= */}
      {/* <section className="relative w-full h-[100vh] overflow-hidden"> */}
      <section className="relative w-full h-[100vh] overflow-hidden z-0">

        {videoSources.map((src, index) => (
          <video
            key={index}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/40"></div>
      </section>

      {/* ========================= Shp by category section ========================= */}
      <section className="w-full bg-white py-16 mt-24">
        {/* Section Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
          Shop by Category
        </h2>

        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 2.5 },
            1024: { slidesPerView: 3.5 },
            1440: { slidesPerView: 4.5 },
          }}
          navigation
          centerInsufficientSlides={true} // 🪄 This will center if slides are fewer
          className="px-6"
        >
          {categories.map((item, i) => (
            <SwiperSlide key={i} className="px-2 min-w-0">
              <div className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <div className="relative w-full h-[62vh] overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                  <img
                    src={item.src}
                    alt={item.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-0"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 z-10"></div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <button className="bg-[var(--brand-primary)] text-white px-8 py-2 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider whitespace-nowrap border border-[var(--brand-primary)] transition-all duration-300 hover:bg-[var(--brand-secondary)] hover:border-[var(--brand-secondary)] hover:text-white hover:scale-105">
                      View Collection
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base md:text-lg font-medium text-[var(--text-primary)] truncate">
                    {item.label}
                  </h3>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>


        {/* Optional “See All” button */}
        <div className="mt-10 text-center">
          <button className="bg-[var(--brand-primary)] text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider border border-[var(--brand-primary)] transition-all duration-300 hover:bg-[var(--brand-secondary)] hover:border-[var(--brand-secondary)] hover:text-white hover:scale-105">
            View All Categories
          </button>
        </div>
      </section>

      {/* ========================= Second Skin Banner ========================= */}
      <section className="relative w-full h-[100vh] mb-0">
        <Image
          src="/images/home/second-skin-banner.jpg"
          alt="Second Skin"
          fill
          className="object-cover"
        />
      </section>

      {/* ========================= Coats and Coverup Bannner  ========================= */}
      <section className="relative w-full h-[90vh] mt-0">
        <Image
          src="/images/home/coats-coverup.jpg"
          alt="Second Skin"
          fill
          className="object-cover"
        />
      </section>


      {/* ========================= Coats and Coverup section  ========================= */}
      <section className="w-full bg-white py-16">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
          Shop Coats & Cover-Ups
        </h2>

        <Swiper
          modules={[Navigation]}
          slidesPerView={2}
          spaceBetween={30} // clean gap for mobile
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 35 },
            1024: { slidesPerView: 5, spaceBetween: 40 },
          }}
          className="px-6" // balanced padding on both sides
        >
          {products.map((item, i) => (
            <SwiperSlide
              key={i}
              className="!m-0 px-3"
            >
              <a
                href="#"
                className="group flex flex-col text-center cursor-pointer transition-transform duration-300 hover:-translate-y-1"
              >
                {/* 🖼 Image container */}
                <div className="relative w-full h-[50vh] overflow-hidden rounded-2xl bg-white flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300">

                  {/* 🏷 Label */}
                  {item.label && (
                    <div className="absolute top-4 left-4 z-20 bg-white text-[var(--text-primary)] text-[10px] font-semibold uppercase rounded-full shadow-sm flex items-center justify-center w-12 h-12 border border-gray-200">
                      {item.label}
                    </div>
                  )}

                  {/* ❤️ Wishlist Button */}
                  <button
                    type="button"
                    aria-label="Add to wishlist"
                    onClick={() => toggleWishlist(i)}
                    className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-sm transition"
                  >
                    <Heart
                      size={18}
                      className={`transition ${wishlist.includes(i)
                        ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                        : "text-[var(--text-primary)] hover:fill-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                        }`}
                    />
                  </button>

                  {/* 🖼 Product Image */}
                  <img
                    src={item.src}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                  />
                </div>

                {/* 📝 Product Info */}
                <div className="mt-4">
                  <h3 className="text-base md:text-lg font-medium text-[var(--text-primary)] truncate">
                    {item.name}
                  </h3>
                  <p className="text-sm md:text-base text-[var(--text-primary)] mt-1 font-semibold">
                    {item.price}
                  </p>

                  {/* 🎨 Color Circle */}
                  {item.colors && item.colors.length > 0 && (
                    <div className="flex justify-center mt-3 gap-2">
                      {item.colors.slice(0, 3).map((color, index) => (
                        <div
                          key={index}
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}

                      {item.colors.length > 3 && (
                        <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm bg-white flex items-center justify-center text-[10px] font-medium text-[var(--text-primary)]">
                          <Plus size={12} strokeWidth={2} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </a>
            </SwiperSlide>
          ))}

        </Swiper>
        {/* 📢 Bottom Info Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 text-center pt-10 mt-16 max-w-7xl mx-auto px-4">
          <div>
            <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Easy returns
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              Paperless returns, no fuss, no drama
            </p>
          </div>

          <div className="border-t border-gray-300 mt-6 pt-6 sm:mt-0 sm:pt-0 sm:border-t-0 sm:border-l-2 sm:border-gray-400 sm:pl-6">
            <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Worldwide delivery
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              We deliver quickly, no matter where you are in the world
            </p>
          </div>

          <div className="border-t border-gray-300 mt-6 pt-6 sm:mt-0 sm:pt-0 sm:border-t-0 sm:border-l-2 sm:border-gray-400 sm:pl-6">
            <h4 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Made with love
            </h4>
            <p className="text-sm text-[var(--text-muted)]">
              Modesty at the heart of every design
            </p>
          </div>
        </div>

      </section>


      {/* ========================= Customer Review Section ========================= */}
      <section className="bg-[var(--soft-gray)] py-16 w-full">
        <div className="w-full px-4 md:px-8 max-w-[1400px] mx-auto">
          {/* ⭐ Average Rating Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold mb-2">What Our Customers Say</h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  if (starValue <= Math.floor(Number(averageRating))) {
                    return <Star key={i} size={20} className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]" />;
                  } else if (starValue === Math.ceil(Number(averageRating)) && Number(averageRating) % 1 !== 0) {
                    return <StarHalf key={i} size={20} className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]" />;
                  } else {
                    return <StarOff key={i} size={20} className="text-gray-300" />;
                  }
                })}
              </div>
              <span className="text-[var(--text-primary)] font-medium text-lg">
                {averageRating} out of 5
              </span>
            </div>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Based on {totalReviews} customer reviews
            </p>
          </div>

          {/* 🌀 Review Carousel */}
          <Swiper
            modules={[Pagination, Autoplay]}
            slidesPerView={1}
            spaceBetween={30}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true, el: ".review-pagination" }}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="w-full"
          >
            {reviewsList.map((review, i) => {
              const fullStars = Math.floor(review.rating);
              const hasHalfStar = review.rating % 1 !== 0;
              const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

              return (
                <SwiperSlide key={i} className="flex justify-center">
                  <div
                    className="relative bg-white p-5 rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between max-w-[400px] h-[200px] w-full mx-auto"
                  >
                    {/* 🕒 Time - Top Right Corner */}
                    <p className="absolute top-3 right-4 text-[var(--text-muted)] text-xs whitespace-nowrap">
                      {getTimeAgo(review.date)}
                    </p>

                    {/* ⭐ Rating - Center */}
                    <div className="flex justify-center items-center mb-1">
                      {[...Array(fullStars)].map((_, index) => (
                        <Star
                          key={`full-${index}`}
                          size={18}
                          className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                        />
                      ))}
                      {hasHalfStar && (
                        <StarHalf
                          size={18}
                          className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                        />
                      )}
                      {[...Array(emptyStars)].map((_, index) => (
                        <StarOff key={`empty-${index}`} size={18} className="text-gray-300" />
                      ))}
                    </div>

                    {/* 💬 Review Text (2 lines max) */}
                    <div className="relative text-center mt-2">
                      <p className="text-[var(--text-primary)] italic line-clamp-2 leading-snug">
                        “{review.text}”
                      </p>
                      {review.text.length > 80 && (
                        <>
                          <div className="absolute bottom-0 left-0 w-full h-5 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                          <button
                            onClick={() => openModal(review)}
                            className="mt-1 text-xs font-semibold text-[var(--brand-primary)] hover:text-[var(--brand-secondary)] transition"
                          >
                            Read more
                          </button>
                        </>
                      )}
                    </div>

                    {/* 👤 Name - Bottom */}
                    <div className="text-center">
                      <p className="text-[var(--brand-primary)] font-semibold text-sm">
                        — {review.name}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>

              );
            })}
          </Swiper>

          {/* 🔘 Pagination Bullets */}
          <div className="review-pagination flex justify-center mt-8"></div>
        </div>

        {/* ================= MODAL ================= */}
        {showModal && selectedReview && (
          <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <div
              className="bg-white max-w-md w-full rounded-xl p-6 relative animate-[fadeIn_0.3s_ease]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-black"
              >
                <X size={24} />
              </button>

              {/* ⭐ Stars */}
              <div className="flex justify-center mb-3">
                {[...Array(Math.floor(selectedReview.rating))].map((_, index) => (
                  <Star
                    key={`full-modal-${index}`}
                    size={20}
                    className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                  />
                ))}
                {selectedReview.rating % 1 !== 0 && (
                  <StarHalf
                    size={20}
                    className="text-[var(--brand-secondary)] fill-[var(--brand-secondary)]"
                  />
                )}
                {[...Array(5 - Math.ceil(selectedReview.rating))].map((_, index) => (
                  <StarOff key={`empty-modal-${index}`} size={20} className="text-gray-300" />
                ))}
              </div>

              {/* 📝 Full Review */}
              <p className="text-[var(--text-primary)] italic text-center mb-4">
                “{selectedReview.text}”
              </p>

              <div className="text-center">
                <p className="text-[var(--brand-primary)] font-semibold mb-1">
                  — {selectedReview.name}
                </p>
                <p className="text-[var(--text-muted)] text-sm">
                  {getTimeAgo(selectedReview.date)}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ========================= Lookbook Section ========================= */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-semibold mb-6">AW25 LOOKBOOK</h2>
        <p className="max-w-2xl mx-auto text-[var(--text-muted)] mb-8">
          Discover the latest collection and elevate your wardrobe with modern modest essentials.
        </p>
        <button className="bg-[var(--btn-primary)] hover:bg-[var(--btn-secondary)] transition px-8 py-3 rounded-md text-lg uppercase">
          View Lookbook
        </button>
      </section>

      {/* ========================= VIP Club Banner ========================= */}
      <section className="relative w-full h-[90vh] mt-10">
        <Image
          src="/images/home/vip-banner.jpg"
          alt="VIP Club"
          fill
          priority
          className="object-cover"
        />
      </section>

      {/* ========================= Final Section Above Footer ========================= */}
      <section className="max-w-[1600px] mx-auto px-6 py-20 text-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              src: "/images/home/final1.jpg",
              title: "View Lookbook",
              desc: "Discover how effortless modest fashion can be — browse for timeless styling inspirations.",
            },
            {
              src: "/images/home/final2.jpg",
              title: "About us",
              desc: "Modesty at the core of every design",
            },
            {
              src: "/images/home/final3.jpg",
              title: "Introducing Bakhoor",
              desc: "A sensory journey that elevates your space and spirit",
            },
            {
              src: "/images/home/final4.jpg",
              title: "Journal",
              desc: "Dive into our Journal for styling tips, modest fashion inspiration, and behind-the-scenes stories.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              <div className="overflow-hidden rounded-lg w-full h-[500px]">
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="mt-4 px-3 max-w-[90%] mx-auto">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
