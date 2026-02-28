// "use client";

// import { useState, useEffect } from "react";
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation } from "swiper/modules";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import { FaChevronDown } from "react-icons/fa";
// import { faqData } from "@/data/faqData";
// import "swiper/css";
// import "swiper/css/navigation";

// type FAQItem = {
//     question: string;
//     answer: string;
// };

// export default function FaqPage() {
//     const categories = Object.keys(faqData);
//     const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
//     const [activeIndex, setActiveIndex] = useState<number | null>(null);
//     const [isSticky, setIsSticky] = useState<boolean>(false);

//     const toggleFAQ = (index: number) => {
//         setActiveIndex(activeIndex === index ? null : index);
//     };

//     useEffect(() => {
//         const handleScroll = () => setIsSticky(window.scrollY > 300);
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);

//     return (
//         <div className="w-full text-[var(--text-primary)]">
//             {/* 🪄 Hero Section */}
//             <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-24 text-center overflow-hidden">
//                 <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
//                 <div className="relative z-10 max-w-3xl mx-auto px-6">
//                     <h1 className="text-4xl md:text-6xl font-bold mb-4">FAQs</h1>
//                     <p className="text-lg text-white/90 max-w-xl mx-auto">
//                         Find answers to your most common questions, organized by category.
//                         If you still need help, our team is here for you.
//                     </p>
//                 </div>
//             </section>

//             {/* 🧭 Category Carousel with Brand Colors */}
//             <div
//                 className={`bg-white py-5 border-b border-[var(--mid-gray)] transition-all duration-300 ${isSticky ? "sticky top-0 z-30 shadow-md" : ""
//                     }`}
//             >
//                 <div className="max-w-7xl mx-auto relative px-4 md:px-8">
//                     {/* Nav buttons */}
//                     <button
//                         className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 
//               bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
//               text-white rounded-full w-9 h-9 flex items-center justify-center 
//               hover:opacity-90 transition z-10 backdrop-blur-sm shadow-md"
//                     >
//                         <ChevronLeft size={18} />
//                     </button>

//                     <button
//                         className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 
//               bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
//               text-white rounded-full w-9 h-9 flex items-center justify-center 
//               hover:opacity-90 transition z-10 backdrop-blur-sm shadow-md"
//                     >
//                         <ChevronRight size={18} />
//                     </button>

//                     <Swiper
//                         modules={[Navigation]}
//                         slidesPerView="auto"
//                         spaceBetween={12}
//                         navigation={{
//                             nextEl: ".swiper-button-next-custom",
//                             prevEl: ".swiper-button-prev-custom",
//                         }}
//                         breakpoints={{
//                             0: { spaceBetween: 8 },
//                             768: { spaceBetween: 12 },
//                             1024: { spaceBetween: 16 },
//                         }}
//                         className="!px-10"
//                     >
//                         {categories.map((cat, i) => (
//                             <SwiperSlide key={i} className="!w-auto">
//                                 <button
//                                     onClick={() => {
//                                         setActiveCategory(cat);
//                                         setActiveIndex(null);
//                                     }}
//                                     className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
//                     ${activeCategory === cat
//                                             ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
//                                             : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
//                                         }`}
//                                 >
//                                     {cat}
//                                 </button>
//                             </SwiperSlide>
//                         ))}
//                     </Swiper>
//                 </div>
//             </div>

//             {/* ❓ FAQ Accordion Section */}
//             <section className="py-20 bg-[var(--soft-gray)] relative">
//                 <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
//                 <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

//                 <div className="max-w-4xl mx-auto px-6 relative z-10">
//                     {faqData[activeCategory].map((faq: FAQItem, index: number) => (
//                         <div
//                             key={index}
//                             className="border-b border-[var(--mid-gray)] py-5 cursor-pointer group"
//                             onClick={() => toggleFAQ(index)}
//                         >
//                             <div className="flex justify-between items-center">
//                                 <h3 className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
//                                     {faq.question}
//                                 </h3>
//                                 <FaChevronDown
//                                     className={`transition-transform duration-300 text-[var(--brand-secondary)] ${activeIndex === index ? "rotate-180" : "rotate-0"
//                                         }`}
//                                 />
//                             </div>
//                             <div
//                                 className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${activeIndex === index ? "max-h-40 mt-3" : "max-h-0"
//                                     }`}
//                             >
//                                 <p className="text-[var(--text-secondary)] leading-relaxed">
//                                     {faq.answer}
//                                 </p>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </section>

//             {/* 📨 Contact CTA */}
//             <section className="py-20 bg-white text-center relative overflow-hidden">
//                 <div className="absolute inset-0 bg-gradient-to-t from-[var(--soft-gray)] to-transparent opacity-50"></div>
//                 <div className="relative z-10 max-w-xl mx-auto">
//                     <h2 className="text-2xl md:text-3xl font-bold text-[var(--black)] mb-4">
//                         Still have questions?
//                     </h2>
//                     <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
//                         If your question isn’t answered here, our support team will be happy to help.
//                     </p>
//                     <a
//                         href="/contact"
//                         className="group relative inline-flex items-center justify-center overflow-hidden px-8 py-3 font-semibold text-white rounded-lg shadow-md bg-[var(--brand-primary)] hover:scale-[1.03] transition-all duration-500"
//                     >
//                         <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
//                         <span className="relative z-10">Contact Support</span>
//                     </a>
//                 </div>
//             </section>
//         </div>
//     );
// }


"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FaChevronDown } from "react-icons/fa";
import { faqsService, Faq, FaqCategory } from "@/lib/services/front-end/faqsService";
import "swiper/css";
import "swiper/css/navigation";

export default function FaqPage() {
    const [categories, setCategories] = useState<FaqCategory[]>([]);
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isSticky, setIsSticky] = useState<boolean>(false);

    // 🧠 Fetch data
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await faqsService.getAllCategories();
            setCategories(res.data);
            if (res.data.length > 0) {
                setActiveCategory(res.data[0].id);
                fetchFaqs(res.data[0].id);
            }
        } catch (error) {
            console.error("Failed to load FAQ categories", error);
        }
    };

    const fetchFaqs = async (categoryId: number) => {
        try {
            const res = await faqsService.getAllFaqs({ categoryId });
            setFaqs(res.data);
            setActiveIndex(null);
        } catch (error) {
            console.error("Failed to load FAQs", error);
        }
    };

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        // ✅ overflow-x-hidden added here — fixes all horizontal scroll
        <div className="w-full text-[var(--text-primary)] overflow-x-hidden">
            {/* 🪄 Hero Section */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-24 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">FAQs</h1>
                    <p className="text-lg text-white/90 max-w-xl mx-auto">
                        Find answers to your most common questions, organized by category.
                    </p>
                </div>
            </section>

            {/* 🧭 Category Carousel */}
            {categories.length > 0 && (
                <div
                    className={`bg-white py-5 border-b border-[var(--mid-gray)] transition-all duration-300 ${isSticky ? "sticky top-0 z-30 shadow-md" : ""
                        }`}
                >
                    <div className="max-w-7xl mx-auto relative px-4 md:px-8 overflow-hidden">
                        {/* 🧩 Few categories — centered layout */}
                        {categories.length <= 4 ? (
                            <div className="flex flex-wrap justify-center gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            setActiveCategory(cat.id);
                                            fetchFaqs(cat.id);
                                        }}
                                        className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
                ${activeCategory === cat.id
                                                ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                                                : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                                            }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="relative overflow-visible">
                                {/* ✅ Floating Nav Buttons (responsive positioning) */}
                                <button
                                    className="swiper-button-prev-custom absolute left-2 sm:-left-5 top-1/2 -translate-y-1/2 
              bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
              text-white rounded-full w-9 h-9 flex items-center justify-center 
              hover:opacity-90 transition z-20 shadow-md pointer-events-auto"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    className="swiper-button-next-custom absolute right-2 sm:-right-5 top-1/2 -translate-y-1/2 
              bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
              text-white rounded-full w-9 h-9 flex items-center justify-center 
              hover:opacity-90 transition z-20 shadow-md pointer-events-auto"
                                >
                                    <ChevronRight size={18} />
                                </button>

                                {/* ✅ Swiper with scroll + touch drag */}
                                <div className="overflow-hidden">
                                    <Swiper
                                        modules={[Navigation]}
                                        slidesPerView="auto"
                                        spaceBetween={12}
                                        navigation={{
                                            nextEl: ".swiper-button-next-custom",
                                            prevEl: ".swiper-button-prev-custom",
                                        }}
                                        allowTouchMove={true} // ✅ Enables swipe/drag scrolling
                                        grabCursor={true} // ✅ Adds “grab hand” on hover
                                        breakpoints={{
                                            0: { spaceBetween: 8 },
                                            768: { spaceBetween: 12 },
                                            1024: { spaceBetween: 16 },
                                        }}
                                        className="!px-12 cursor-grab active:cursor-grabbing"
                                    >
                                        {categories.map((cat) => (
                                            <SwiperSlide key={cat.id} className="!w-auto">
                                                <button
                                                    onClick={() => {
                                                        setActiveCategory(cat.id);
                                                        fetchFaqs(cat.id);
                                                    }}
                                                    className={`px-4 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
                      ${activeCategory === cat.id
                                                            ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                                                            : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                                                        }`}
                                                >
                                                    {cat.name}
                                                </button>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>

                                {/* ✨ Optional fade edges (visual polish) */}
                                <div className="pointer-events-none absolute left-0 top-0 w-8 h-full bg-gradient-to-r from-white to-transparent"></div>
                                <div className="pointer-events-none absolute right-0 top-0 w-8 h-full bg-gradient-to-l from-white to-transparent"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* ❓ FAQ Section */}
            <section className="py-20 bg-[var(--soft-gray)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    {faqs.length > 0 ? (
                        faqs.map((faq, index) => (
                            <div
                                key={faq.id}
                                className="border-b border-[var(--mid-gray)] py-5 cursor-pointer group"
                                onClick={() => toggleFAQ(index)}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                                        {faq.question}
                                    </h3>
                                    <FaChevronDown
                                        className={`transition-transform duration-300 text-[var(--brand-secondary)] ${activeIndex === index ? "rotate-180" : "rotate-0"
                                            }`}
                                    />
                                </div>
                                <div
                                    className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${activeIndex === index ? "max-h-40 mt-3" : "max-h-0"
                                        }`}
                                >
                                    <p className="text-[var(--text-secondary)] leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-[var(--text-secondary)] py-12">
                            No FAQs found for this category.
                        </p>
                    )}
                </div>
            </section>

            {/*  Contact CTA */}
            <section className="py-20 bg-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--soft-gray)] to-transparent opacity-50"></div>
                <div className="relative z-10 max-w-xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--black)] mb-4">
                        Still have questions?
                    </h2>
                    <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto">
                        If your question isn’t answered here, our support team will be happy to help.
                    </p>
                    <a
                        href="/contact"
                        className="group relative inline-flex items-center justify-center overflow-hidden px-8 py-3 font-semibold text-white rounded-lg shadow-md bg-[var(--brand-primary)] hover:scale-[1.03] transition-all duration-500"
                    >
                        <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative z-10">Contact Support</span>
                    </a>
                </div>
            </section>
        </div>
    );
}

