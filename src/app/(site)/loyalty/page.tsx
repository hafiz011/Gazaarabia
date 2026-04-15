"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    FaShoppingBag,
    FaEnvelope,
    FaGift,
    FaMobileAlt,
    FaUserAlt,
    FaStar,
    FaCrown,
    FaChevronDown
} from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

export default function LoyaltyPage() {
    const categories = ["Overview", "Tier Benefits", "Earning", "Redeem", "FAQs"];
    const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [isSticky, setIsSticky] = useState<boolean>(false);

    const tiers = [
        { name: "Member", range: "100–500 pts", icon: <FaUserAlt size={28} /> },
        { name: "Insider", range: "501–1000 pts", icon: <FaStar size={28} /> },
        { name: "Elite", range: "1001+ pts", icon: <FaCrown size={28} /> },
    ];

    const benefits = [
        "Redeem Points at Checkout",
        "Early Access to Sale",
        "Birthday Bonus Points",
        "Double Points Days",
        "VIP Shopping Days",
        "Early Access to New Collections",
        "Exclusive Event Invites",
    ];

    const earnOptions = [
        { icon: <FaShoppingBag size={32} />, title: "Make a Purchase", desc: "1 point per £1" },
        { icon: <FaEnvelope size={32} />, title: "Sign Up", desc: "Bonus welcome points" },
        { icon: <FaGift size={32} />, title: "Birthday Bonus", desc: "Receive 300 points" },
        { icon: <FaMobileAlt size={32} />, title: "Follow Us", desc: "Earn social points" },
    ];

    const faqItems = [
        { q: "How can I earn points?", a: "You can earn points on every purchase, signing up, following us on social media and more." },
        { q: "How can I redeem points?", a: "Redeem points directly at checkout by entering the amount you'd like to use." },
        { q: "Do my points expire?", a: "Points are valid for 12 months from the date they were earned." },
        { q: "Can I use discount codes and points at the same time?", a: "Yes! You can combine both for maximum savings." },
    ];

    useEffect(() => {
        const handleScroll = () => setIsSticky(window.scrollY > 300);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleFAQ = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="w-full text-[var(--text-primary)]">
            {/* 🪄 HERO SECTION */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-28 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">Loyalty & Rewards</h1>
                    <p className="text-lg text-white/90 max-w-xl mx-auto">
                        Earn points every time you shop and unlock exclusive rewards. Join our VIP Club and elevate your shopping experience.
                    </p>
                </div>
            </section>

            {/* 🧭 Sticky Category Navigation */}
            <div
                className={`bg-white py-5 border-b border-[var(--mid-gray)] transition-all duration-300 ${isSticky ? "sticky top-0 z-30 shadow-md" : ""
                    }`}
            >
                <div className="max-w-7xl mx-auto relative px-4 md:px-8 flex justify-center">
                    {/* Left Arrow */}
                    <button
                        className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 
                        bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
                        text-white rounded-full w-9 h-9 flex items-center justify-center 
                        hover:opacity-90 transition z-10 backdrop-blur-sm shadow-md"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {/* Right Arrow */}
                    <button
                        className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 
                        bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
                        text-white rounded-full w-9 h-9 flex items-center justify-center 
                        hover:opacity-90 transition z-10 backdrop-blur-sm shadow-md"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <Swiper
                        modules={[Navigation]}
                        slidesPerView="auto"
                        spaceBetween={18}
                        centeredSlides={true}
                        navigation={{
                            nextEl: ".swiper-button-next-custom",
                            prevEl: ".swiper-button-prev-custom",
                        }}
                        breakpoints={{
                            0: { spaceBetween: 10 },
                            768: { spaceBetween: 16 },
                            1024: { spaceBetween: 24 },
                        }}
                        className="!px-20 flex justify-center w-full max-w-[1000px]"
                    >
                        {categories.map((cat, i) => (
                            <SwiperSlide key={i} className="!w-auto flex justify-center">
                                <button
                                    onClick={() => {
                                        setActiveCategory(cat);
                                        scrollToSection(cat.replace(/\s+/g, "-"));
                                    }}
                                    className={`px-6 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
                                        ${activeCategory === cat
                                            ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                                            : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                                        }`}
                                >
                                    {cat}
                                </button>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>

            {/* 🪙 TIER OVERVIEW */}
            <section className="py-20 bg-[var(--soft-gray)] text-center relative overflow-hidden" id="Overview">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">Tier Overview</h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-10 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {tiers.map((tier, i) => (
                            <div
                                key={i}
                                className="group relative rounded-2xl px-8 py-10 w-[250px] border border-[var(--mid-gray)] 
                                bg-white flex flex-col items-center overflow-hidden shadow-sm transition-all duration-500 
                                hover:shadow-xl hover:-translate-y-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center justify-center w-16 h-16 rounded-full 
                                        bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] 
                                        text-white mb-4 shadow-md group-hover:scale-110 transition-transform duration-500">
                                        {tier.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-[var(--brand-primary)] mb-1">{tier.name}</h3>
                                    <p className="text-[var(--text-secondary)]">{tier.range}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 🏅 TIER BENEFITS TABLE */}
            <section className="py-20 bg-white text-center" id="Tier-Benefits">
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">Tier Benefits</h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-10 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    <div className="overflow-x-auto rounded-xl border border-[var(--mid-gray)] shadow-sm mx-auto">
                        <table className="w-full text-left border-collapse mx-auto text-center">
                            <thead className="bg-[var(--soft-gray)] text-[var(--text-primary)]">
                                <tr>
                                    <th className="py-4 px-4 text-sm font-semibold text-left">Benefits</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-center">Member</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-center">Insider</th>
                                    <th className="py-4 px-4 text-sm font-semibold text-center">Elite</th>
                                </tr>
                            </thead>
                            <tbody>
                                {benefits.map((benefit, i) => (
                                    <tr key={i} className="border-t border-[var(--soft-gray)] hover:bg-[var(--soft-gray)] transition">
                                        <td className="py-4 px-4 text-left">{benefit}</td>
                                        <td className="py-4 px-4 text-center">✔️</td>
                                        <td className="py-4 px-4 text-center">{i >= 1 ? "✔️" : "—"}</td>
                                        <td className="py-4 px-4 text-center">{i >= 2 || i < 5 ? "✔️" : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 🪙 HOW TO EARN */}
            <section className="py-20 bg-white relative overflow-hidden text-center" id="Earning">
                <div className="absolute top-0 right-0 w-[26rem] h-[26rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 -translate-y-10"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-20 translate-y-10"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">How to Earn Points</h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-10 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-center">
                        {earnOptions.map((item, i) => (
                            <div
                                key={i}
                                className="group relative p-8 rounded-xl border border-[var(--mid-gray)] bg-white
                                text-center flex flex-col items-center justify-center overflow-hidden shadow-sm 
                                transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="flex items-center justify-center mb-4 text-[var(--brand-secondary)] group-hover:scale-110 transition-transform duration-500">
                                        {item.icon}
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                    <p className="text-[var(--text-secondary)] text-sm">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 💰 HOW TO REDEEM */}
            <section className="py-20 bg-white text-center relative overflow-hidden" id="Redeem">
                <div className="absolute top-0 left-0 w-80 h-80 bg-[var(--brand-secondary)] opacity-10 rounded-full blur-3xl -translate-x-20 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--brand-primary)] opacity-10 rounded-full blur-3xl translate-x-20 translate-y-20"></div>

                <div className="relative max-w-xl mx-auto z-10 bg-[var(--soft-gray)] p-10 rounded-2xl border border-[var(--mid-gray)] shadow-md backdrop-blur-sm">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">Redeem Your Points</h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-6 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    <p className="mb-6 text-[var(--text-secondary)] text-sm">
                        Convert your points into instant savings at checkout.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
                        <input
                            type="number"
                            placeholder="Enter points"
                            className="flex-1 px-4 py-3 border border-[var(--mid-gray)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
                        />
                        <button
                            className="relative inline-flex items-center justify-center overflow-hidden px-6 py-3 font-semibold text-white rounded-lg shadow-md bg-[var(--brand-primary)] hover:scale-[1.03] transition-all duration-500"
                        >
                            <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
                            <span className="relative z-10">Redeem</span>
                        </button>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] mt-3">
                        300 points = £100.00
                    </p>
                </div>
            </section>

            {/*  FAQ SECTION */}
            <section className="py-20 bg-white relative text-center" id="FAQs">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">FAQs</h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-10 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className="border-b border-[var(--mid-gray)] py-5 cursor-pointer group text-left"
                            onClick={() => toggleFAQ(index)}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                                    {item.q}
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
                                <p className="text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/*  Contact CTA */}
            <section className="py-20 bg-[var(--soft-gray)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-50"></div>
                <div className="relative z-10 max-w-xl mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--black)] mb-4">
                        Still have questions?
                    </h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-6 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>
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
