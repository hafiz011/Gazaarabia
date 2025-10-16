"use client";

import { ShoppingBag, PenTool, Factory, Handshake, Globe } from "lucide-react";

export default function HowWeDoIt() {
    const values = [
        {
            icon: <ShoppingBag size={36} className="text-[var(--brand-primary)]" />,
            title: "Direct to Consumer",
            desc: "No middlemen. Quality at honest prices.",
        },
        {
            icon: <PenTool size={36} className="text-[var(--brand-secondary)]" />,
            title: "Designed In-House",
            desc: "All pieces designed by our creative team.",
        },
        {
            icon: <Factory size={36} className="text-[var(--brand-primary)]" />,
            title: "No Mass Production",
            desc: "Each product made in small batches.",
        },
        {
            icon: <Handshake size={36} className="text-[var(--brand-secondary)]" />,
            title: "Supporting Small Factories",
            desc: "Ethical sourcing & fair wages.",
        },
        {
            icon: <Globe size={36} className="text-[var(--brand-primary)]" />,
            title: "Online & Concessions",
            desc: "Seamless shopping experience.",
        },
    ];

    return (
        <section className="bg-[var(--soft-gray)] py-14 md:py-16 w-full">
            <div className="w-full px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-semibold mb-2 text-[var(--text-primary)]">
                        How We Do It
                    </h2>
                    <p className="text-[var(--text-muted)] text-sm max-w-[600px] mx-auto">
                        Our commitment goes beyond products — it's about people, quality, and responsibility.
                    </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8">
                    {values.map((item, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center justify-center gap-3 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-1"
                        >
                            <div className="mb-2">{item.icon}</div>
                            <h4 className="font-semibold text-[var(--text-primary)] text-base text-center">
                                {item.title}
                            </h4>
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed text-center">
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
