"use client";

import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function ShippingAndDeliveryPage() {
    const categories = ["United Kingdom", "Rest of the World"];
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const deliveryData: Record<string, { title: string; desc: string }[]> = {
        "United Kingdom": [
            { title: "Free Delivery", desc: "Free UK delivery on all orders over £120." },
            { title: "Next Day Delivery", desc: "Delivery time: 1 working day. Cost: £8. Order by 1 PM Monday–Thursday." },
            { title: "Standard Delivery", desc: "Delivery time: 3–5 working days. Cost: £5.50." },
        ],
        "Rest of the World": [
            { title: "Express Delivery", desc: "Delivery time: 2–3 working days. Cost: $30." },
            { title: "Free Delivery", desc: "Free international shipping on orders over £120." },
        ],
    };

    const accordionData: Record<string, { question: string; answer: string }[]> = {
        "United Kingdom": [
            {
                question: "UK Standard Delivery",
                answer: "Our standard UK delivery takes 3–5 working days. Orders over £120 are delivered free of charge.",
            },
            {
                question: "UK Next Day Delivery",
                answer: "Place your order before 1:00 PM Monday–Thursday for next working day delivery.",
            },
            {
                question: "Free Shipping Policy",
                answer: "Free shipping is automatically applied at checkout for orders over £120.",
            },
        ],
        "Rest of the World": [
            {
                question: "International Delivery",
                answer: "We deliver to most countries worldwide. Express shipping typically takes 2–3 working days.",
            },
            {
                question: "Customs & Duties",
                answer: "Customs or import duties may be applied once the parcel reaches your country. Customers are responsible for these charges.",
            },
            {
                question: "Order Tracking",
                answer: "Once your order is shipped, you'll receive a tracking link via email.",
            },
        ],
    };

    return (
        <div className="w-full text-[var(--text-primary)]">
            {/* 🪄 Hero Section */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-24 md:py-28 flex items-center justify-center text-center">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-wide">
                        Shipping & Delivery
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg text-white/90 leading-relaxed">
                        We ship worldwide. Check your region for delivery times, costs, and shipping options.
                    </p>
                </div>
            </section>

            {/* 🌍 Centered Category Buttons */}
            <div className="bg-white py-8 border-b border-[var(--mid-gray)]">
                <div className="max-w-6xl mx-auto px-4 flex justify-center gap-4 flex-wrap">
                    {categories.map((cat, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setActiveCategory(cat);
                                setActiveIndex(null);
                            }}
                            className={`px-6 py-2 text-sm font-medium rounded-full border transition whitespace-nowrap
                                ${activeCategory === cat
                                    ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                                    : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 🚚 Delivery Cards */}
            <section className="py-20 bg-[var(--soft-gray)]">
                <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-10 text-center">
                    {deliveryData[activeCategory].map((item, i) => (
                        <div
                            key={i}
                            className="group relative flex flex-col items-center justify-center bg-white 
                   rounded-2xl p-10 w-full sm:w-[300px] md:w-[320px]
                   shadow-sm border border-[var(--mid-gray)] 
                   transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                            <h3 className="relative z-10 text-xl font-semibold text-[var(--brand-primary)] mb-2">
                                {item.title}
                            </h3>
                            <p className="relative z-10 text-[var(--text-secondary)] leading-relaxed">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>


            {/* ❓ Accordion Section */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--brand-primary)] mb-10">
                        Delivery Information
                    </h2>

                    {accordionData[activeCategory].map((item, index) => (
                        <div
                            key={index}
                            className="border-b border-[var(--mid-gray)] py-5 cursor-pointer group"
                            onClick={() => toggleAccordion(index)}
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                                    {item.question}
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
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📍 Map Section */}
            <section className="relative h-[600px] w-full overflow-hidden">
                <iframe
                    title="Store Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3503.781019773899!2d77.20898537492437!3d28.57411788615766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2e68e2b72fb%3A0x1f9d6a2b24ef2a58!2sNew%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1674034860378!5m2!1sen!2sin"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>

                <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 flex items-center h-full justify-start md:justify-center">
                    <div className="bg-white/90 backdrop-blur-md p-10 rounded-2xl shadow-lg max-w-md border border-[var(--mid-gray)] text-center">
                        <h3 className="text-3xl font-bold text-[var(--black)] mb-4">
                            Visit Our <span className="text-[var(--brand-primary)]">Store</span>
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-6 leading-relaxed text-sm">
                            Pick up your orders in-store or explore our latest collection in person. We’d love to welcome you.
                        </p>

                        <ul className="space-y-3 text-[var(--text-secondary)] text-sm mb-6">
                            <li><span className="text-[var(--brand-secondary)] font-semibold">📍</span> 123 Arab Street, New Delhi, India</li>
                            <li><span className="text-[var(--brand-secondary)] font-semibold">📞</span> +91 98765 43210</li>
                            <li><span className="text-[var(--brand-secondary)] font-semibold">🕒</span> Mon - Sat | 10 AM - 8 PM</li>
                        </ul>

                        <a
                            href="#"
                            className="relative inline-flex items-center justify-center overflow-hidden px-6 py-3 font-semibold text-white rounded-lg shadow-md bg-[var(--brand-primary)] hover:shadow-lg transition-all duration-500 hover:scale-[1.02]"
                        >
                            <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 hover:opacity-100 transition-opacity duration-500"></span>
                            <span className="relative z-10">Get Directions</span>
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
