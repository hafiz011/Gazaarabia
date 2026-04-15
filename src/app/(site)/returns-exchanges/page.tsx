"use client";

import { motion } from "framer-motion";

export default function ReturnsExchangesPage() {
    const sections = [
        {
            title: "General Policy",
            content: `
Returns & Exchanges – GAZAARABIA

We want you to feel confident and comfortable in every piece you wear. If something isn’t quite right, you may be able to return or exchange your order, as long as it meets the conditions below.

– Items must be unworn, unwashed, undamaged, with original tags and packaging.
– For hygiene reasons, hijabs, undercaps and sale items may be non-returnable (you can decide this).
– Please do not wear perfume, makeup or deodorant that can transfer onto the fabric when trying items on.
            `,
        },
        {
            title: "UK Returns & Exchanges",
            content: `
UK Customers

– Return window: 14 days from the date you receive your order.
– Returns cost: The customer pays return postage, unless the item is faulty or we made a mistake.
– Exchanges: If you want a different size/colour, you can request an exchange (subject to stock).

How it works:
    1. Email us at info@gazaarabia.com with your order number and reason for return.
    2. We’ll send you the return address and instructions.
    3. Send the parcel back using a tracked service and keep your receipt.
    4. Once approved, we’ll process your refund or exchange within 5–10 working days of receiving your return.
            `,
        },
        {
            title: "Europe (France, Germany, Spain, Belgium & other EU countries)",
            content: `
EU Customers (France, Germany, Spain, Belgium & other EU countries)

– Return window: 14 days from the date you receive your order.
– Returns cost: Customers are responsible for return shipping costs.
– Exchanges: For most EU orders, we recommend a refund + new order (exchanges can become very slow/expensive across borders).

Important:
– Any import duties or taxes paid to your local customs office are non-refundable by us. You may be able to claim them back from your local authority depending on your country’s rules.

How it works:
    1. Email info@gazaarabia.com with your order number and what you’d like to return.
    2. We’ll confirm the return address in the UK and any customs info to include on the parcel.
    3. Send your parcel back with a tracked service.
    4. Once we receive and approve the items, we’ll refund the product cost within 5–10 working days (shipping fees are usually non-refundable).
            `,
        },
        {
            title: "Rest of World (US, Canada, Middle East, etc.)",
            content: `
Rest of World Customers (e.g. USA, Canada, GCC, others)

– Return window: 14 days from the date you receive your order.
– Returns cost: Customers are responsible for return shipping costs.
– Because of high international shipping costs, we usually recommend a refund rather than an exchange.

Customs & Duties:
– Any customs duties, taxes or handling fees charged by your country are non-refundable by us.

How it works:
    1. Email info@gazaarabia.com with your order number and details of the items you’d like to return.
    2. We’ll confirm if the item is eligible and share the return address + customs declaration guidance.
    3. Return the parcel using a tracked service.
    4. After inspection, we’ll process your refund within 5–10 working days of receiving the parcel.
            `,
        },
        {
            title: "Faulty or Wrong Item",
            content: `
Faulty / Incorrect Items

If you receive an item that is damaged, faulty or not what you ordered:
– Contact us within 7 days of receiving your parcel.
– Attach clear photos of the issue and your packing slip.
– If confirmed, we will:
– Replace the item where possible, or
– Offer a refund, and
– Cover reasonable return shipping costs (or send a prepaid label if available).
            `,
        },
    ];

    return (
        <div className="w-full bg-white text-[var(--text-primary)]">

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] 
                text-white py-20 text-center overflow-hidden"
            >
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Returns & Exchanges
                    </h1>

                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Your complete guide to returning or exchanging any GAZAARABIA purchase.
                    </p>

                    {/* LAST UPDATED */}
                    {/* <div className="mt-6 inline-block bg-white/10 backdrop-blur-md 
                        px-6 py-3 rounded-lg border border-white/20"
                    >
                        <p className="text-sm text-white/90">
                            <span className="font-medium">Last updated:</span> November 21, 2025
                        </p>
                    </div> */}
                </div>
            </section>

            {/* PAGE CONTENT (Same style as privacy policy) */}
            <section className="relative py-20 bg-[var(--soft-gray)] overflow-hidden">

                {/* Background accents (same as privacy policy) */}
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">

                    {/* PAGE SECTIONS */}
                    <div className="space-y-16">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-xl md:text-2xl font-semibold 
                                    text-[var(--brand-primary)] mb-4"
                                >
                                    {section.title}
                                </h3>

                                <p className="text-[var(--text-secondary)] text-base leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>

                                {index !== sections.length - 1 && (
                                    <div className="mt-12 border-b border-[var(--mid-gray)] opacity-30"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* BOTTOM BUTTON */}
                    <div className="mt-12 flex flex-col items-center gap-4 text-center">
                        <a
                            href="/contact"
                            className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] 
                            text-white font-medium px-10 py-3 rounded-lg hover:opacity-90 transition text-base shadow-md"
                        >
                            Contact Returns Team
                        </a>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Or email us directly at{" "}
                            <a
                                href="mailto:info@gazaarabia.com?subject=Returns%20%26%20Exchanges%20Request"
                                className="text-[var(--brand-primary)] font-medium underline underline-offset-2 hover:opacity-80 transition"
                            >
                                info@gazaarabia.com
                            </a>
                        </p>
                    </div>


                </div>
            </section>
        </div>
    );
}
