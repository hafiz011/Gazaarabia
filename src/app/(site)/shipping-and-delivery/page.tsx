"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import { useSession } from "next-auth/react";
import { deliverySettingsService } from "@/lib/services/deliverySettingsService";
import { MapPin, Phone, Clock, Truck } from "lucide-react";
import Loader from "@/components/Loader";
import NoData from "@/components/NoData";

export default function ShippingAndDeliveryPage() {
    const categories = ["United Kingdom", "Rest of the World"];
    const [activeCategory, setActiveCategory] = useState(categories[0]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [loading, setLoading] = useState(false)

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // API DATA
    const { data: session } = useSession();
    const token = session?.user?.token;

    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const res = await deliverySettingsService.get(token);

                if (res?.success) {
                    setSettings(res.data);
                } else {
                    setSettings(null);
                }
            } catch (error) {
                console.error("Failed to load delivery settings", error);
                setSettings(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [token]);


    // -------------------------------
    //  DYNAMIC DATA FOR U.K.
    // -------------------------------
    const UKdelivery = [
        {
            title: "Free Delivery",
            desc: settings?.freeDeliveryText || "Free delivery over £120.",
        },
        {
            title: settings?.nextDayTitle,
            desc: `Delivery time: ${settings?.nextDayDeliveryTime}. Cost: ${settings?.nextDayCost}. Order by ${settings?.nextDayOrderCutOff}.`,
        },
        {
            title: settings?.standardDeliveryTitle,
            desc: `Delivery time: ${settings?.standardDeliveryMinDays}–${settings?.standardDeliveryMaxDays} working days. Cost: ${settings?.standardDeliveryCost}.`,
        },
    ];

    const UKaccordion = [
        {
            question: settings?.standardDeliveryTitle,
            answer: `Standard delivery takes ${settings?.standardDeliveryMinDays}–${settings?.standardDeliveryMaxDays} working days. Cost: ${settings?.standardDeliveryCost}.`,
        },
        {
            question: settings?.nextDayTitle,
            answer: `Next day delivery: ${settings?.nextDayDeliveryTime}, cost ${settings?.nextDayCost}, order by ${settings?.nextDayOrderCutOff}.`,
        },
        {
            question: "Free Shipping Policy",
            answer: settings?.freeDeliveryText,
        },
        {
            question: "Returns & Exchanges",
            answer: settings?.returnText || "Please refer to our return policy.",
        },
    ];

    // -------------------------------
    //   DYNAMIC INTERNATIONAL DATA
    // -------------------------------
    const InternationalDelivery = [
        {
            title: settings?.internationalTitle || "International Express Delivery",
            desc: `Delivery time: ${settings?.internationalDeliveryTime}. Cost: ${settings?.internationalCost}.`,
        },
        {
            title: "Free Delivery",
            desc: settings?.internationalFreeDeliveryText || "Free international delivery on orders over £120.",
        },
    ];

    const InternationalAccordion = [
        {
            question: settings?.internationalTitle || "International Delivery",
            answer: `Delivery time: ${settings?.internationalDeliveryTime}. Cost: ${settings?.internationalCost}.`,
        },
        {
            question: "Customs & Duties",
            answer: settings?.internationalCustomsText,
        },
        // {
        //     question: "Order Tracking",
        //     answer: settings?.internationalTrackingText,
        // },
    ];

    // -------------------------------
    //  FINAL DELIVERY MAPPING
    // -------------------------------
    const deliveryData: Record<string, any[]> = {
        "United Kingdom": UKdelivery,
        "Rest of the World": InternationalDelivery,
    };

    const accordionData: Record<string, any[]> = {
        "United Kingdom": UKaccordion,
        "Rest of the World": InternationalAccordion,
    };

    // ===============================
    // FULL SHIPPING & RETURNS FAQ
    // ===============================
    const FullFAQ = [
        {
            q: "Where do you ship from?",
            a: (
                <p>All orders are shipped from the UK.</p>
            ),
        },

        {
            q: "Which countries do you ship to?",
            a: (
                <div>
                    <p>We currently ship to:</p>
                    <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>UK</li>
                        <li>Europe (France, Germany, Spain, Belgium and others)</li>
                        <li>North America (USA & Canada)</li>
                        <li>Selected Middle East & Rest of World countries</li>
                    </ul>
                    <p className="mt-3">
                        If your country isn’t available at checkout, please contact us and we’ll do our best to help.
                    </p>
                </div>
            ),
        },

        {
            q: "How long does delivery take?",
            a: (
                <div>
                    <p className="font-semibold">UK</p>
                    <ul className="list-disc ml-6 mb-4 space-y-1">
                        <li>Standard tracked: 2–4 working days</li>
                        <li>Express: 1–2 working days</li>
                    </ul>

                    <p className="font-semibold">Europe</p>
                    <ul className="list-disc ml-6 mb-4 space-y-1">
                        <li>Standard tracked: 3–7 working days (Spain: 4–8)</li>
                        <li>Express: 1–3 working days</li>
                    </ul>

                    <p className="font-semibold">Rest of World</p>
                    <ul className="list-disc ml-6 space-y-1">
                        <li>Typically 7–14 working days depending on destination</li>
                    </ul>

                    <p className="mt-3">Delivery timeframes are estimates and may vary during peak seasons.</p>
                </div>
            ),
        },

        {
            q: "How much is shipping?",
            a: (
                <div>
                    <p>Shipping costs depend on your country and total order weight.</p>
                    <p className="mt-2">Exact rates appear at checkout before payment.</p>
                    <p className="mt-2">
                        We also offer free shipping above a certain order value in selected regions (UK & EU).
                    </p>
                </div>
            ),
        },

        {
            q: "Will I have to pay customs or import taxes?",
            a: (
                <div>
                    <p>International orders may incur customs duties or taxes.</p>
                    <p className="mt-2">
                        These charges are set by your country’s customs office and are the customer's responsibility.
                    </p>
                    <p className="mt-2">
                        We complete accurate customs paperwork to help avoid delays, but we cannot control these fees.
                    </p>
                </div>
            ),
        },

        {
            q: "How do I track my order?",
            a: (
                <div>
                    <p>You will receive an email with your tracking link once your order is dispatched.</p>
                    <p className="mt-2">
                        If you can’t find it, check your spam folder or contact us with your order number.
                    </p>
                </div>
            ),
        },

        {
            q: "What is your returns policy?",
            a: (
                <div>
                    <p className="font-semibold">UK</p>
                    <ul className="list-disc ml-6 mb-4 space-y-1">
                        <li>14-days After Delivery</li>
                        <li>Items must be unused, unwashed, with tags</li>
                        <li>Customer pays return postage (unless faulty)</li>
                    </ul>

                    <p className="font-semibold">Europe & Rest of World</p>
                    <ul className="list-disc ml-6 space-y-1">
                        <li>14-days After Delivery</li>
                        <li>Customer covers return shipping cost</li>
                        <li>We recommend refund rather than exchange for international customers</li>
                    </ul>

                    <p className="mt-3">
                        Customs duties or taxes are not refundable by us.
                    </p>
                </div>
            ),
        },

        {
            q: "How do I request a return?",
            a: (
                <ol className="list-decimal ml-6 space-y-2">
                    <li>Email us at <strong>info@gazaarabia.com</strong> with your order number and reason.</li>
                    <li>We confirm eligibility and send return instructions.</li>
                    <li>Ship back using a tracked service and keep proof of postage.</li>
                    <li>Refund processed within 5–10 business days after inspection.</li>
                </ol>
            ),
        },

        {
            q: "Can I exchange my item for a different size?",
            a: (
                <div>
                    <p className="font-semibold">UK Customers:</p>
                    <p className="ml-4">Yes, if the new size/colour is in stock.</p>

                    <p className="font-semibold mt-3">International Customers:</p>
                    <p className="ml-4">Refund + new order is usually faster and cheaper.</p>
                </div>
            ),
        },

        {
            q: "What if my item is faulty or incorrect?",
            a: (
                <ol className="list-decimal ml-6 space-y-2">
                    <li>Contact us within 7 days of receiving your order.</li>
                    <li>Include photos of the issue and your packing slip.</li>
                    <li>
                        If confirmed faulty, we replace/refund and cover return shipping (or send prepaid label where supported).
                    </li>
                </ol>
            ),
        },

        {
            q: "Which items are non-returnable?",
            a: (
                <ul className="list-disc ml-6 space-y-1">
                    <li>Hijabs, undercaps, intimates</li>
                    <li>Final sale / clearance items</li>
                </ul>
            ),
        },
    ];


    // if (loading) return <Loader />;
    if (loading) {
        return (
            <div className="flex justify-center mt-20">
                <Loader />
            </div>
        );
    }

    return (
        <>

            {!settings && (
                <div className="mt-16 flex justify-center">
                    <NoData
                        message="Delivery settings not configured yet."
                        icon={Truck}
                    />
                </div>
            )}

            {settings &&
                <>

                    <div className="w-full text-[var(--text-primary)]">

                        {/* HERO SECTION */}
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

                        {/* CATEGORY BUTTONS */}
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

                        {/* DELIVERY CARDS */}
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


                        {/* SHIPPING & RETURNS FAQ – ACCORDION */}
                        <section className="py-20 bg-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                            <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                            <div className="max-w-4xl mx-auto px-6 relative z-10">
                                <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--brand-primary)] mb-10">
                                    Shipping & Returns – FAQ
                                </h2>

                                {FullFAQ.map((item, index) => (
                                    <div
                                        key={index}
                                        className="border-b border-[var(--mid-gray)] py-5 cursor-pointer group"
                                        onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors duration-300">
                                                {item.q}
                                            </h3>

                                            <FaChevronDown
                                                className={`transition-transform duration-300 text-[var(--brand-secondary)]
              ${activeIndex === index ? "rotate-180" : "rotate-0"}`}
                                            />
                                        </div>

                                        <div
                                            className={`overflow-hidden transition-[max-height] duration-500 ease-in-out 
            ${activeIndex === index ? "max-h-[1200px] mt-3" : "max-h-0"}`}
                                        >
                                            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                                                {item.a}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>


                        {/* MAP SECTION */}
                        {/* <section className="relative h-[600px] w-full overflow-hidden">
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

                                    <ul className="space-y-4 text-[var(--text-secondary)] text-sm mb-6">

                                        <li className="flex justify-center items-start gap-2">
                                            <MapPin size={18} className="text-[var(--brand-secondary)] mt-[0px]" />
                                            <span className="leading-tight">
                                                45 Kensington High Street, London, W8 5EB, United Kingdom
                                            </span>
                                        </li>


                                    
                                        <li className="flex items-center justify-center gap-2">
                                            <Phone size={18} className="text-[var(--brand-secondary)]" />
                                            +44 20 3287 1234
                                        </li>

                                        
                                        <li className="flex items-center justify-center gap-2">
                                            <Clock size={18} className="text-[var(--brand-secondary)]" />
                                            Mon – Sat | 10 AM – 7 PM
                                        </li>

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

                        </section>  */}
                    </div>

                </>
            }

        </>



    );
}
