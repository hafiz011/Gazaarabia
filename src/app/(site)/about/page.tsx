"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaGem, FaLeaf } from "react-icons/fa";


export default function AboutPage() {
    const router = useRouter();
    return (
        <main className="bg-[var(--background)] text-[var(--text-primary)]">
            {/*  HERO SECTION */}
            <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/about/hero.jpg"
                    alt="About Gazaarabia"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70"></div>
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-wide uppercase mb-6">
                        About Gazaarabia
                    </h1>
                    <p className="text-lg md:text-xl max-w-2xl mx-auto text-gray-200 leading-relaxed">
                        A legacy of elegance, culture, and modern modest fashion.
                    </p>
                </div>
            </section>

            {/*  STORY SECTION */}
            <section className="max-w-5xl mx-auto px-6 py-24 text-center">
                <h2 className="text-4xl font-bold mb-8 uppercase tracking-wide">
                    Our Story
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
                    Founded with a vision to redefine modest fashion, <strong>Gazaarabia</strong>
                    merges traditional elegance with modern craftsmanship. Our designs celebrate
                    identity, culture, and sophistication — offering timeless collections for
                    those who lead with grace and confidence.
                </p>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto mt-6">
                    Today, we stand as a symbol of refined modest wear — worn by individuals across the globe who share our love for simplicity, class, and cultural pride.
                </p>
            </section>

            {/*  MISSION & VALUES */}
            <section className="bg-[var(--soft-gray)] py-24">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <h2 className="text-4xl font-bold mb-12 uppercase tracking-wide">
                        Our Mission & Values
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="p-10 bg-white rounded-lg shadow-sm border-t-4 border-[var(--brand-primary)] hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-4 text-[var(--brand-primary)]">
                                Timeless Modesty
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                We design with purpose — creating elegant, modest pieces that transcend trends.
                            </p>
                        </div>
                        <div className="p-10 bg-white rounded-lg shadow-sm border-t-4 border-[var(--brand-secondary)] hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-4 text-[var(--brand-secondary)]">
                                Conscious Craft
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                From ethical sourcing to sustainable production, we are committed to responsibility.
                            </p>
                        </div>
                        <div className="p-10 bg-white rounded-lg shadow-sm border-t-4 border-[var(--brand-primary)] hover:shadow-md transition">
                            <h3 className="text-xl font-semibold mb-4 text-[var(--brand-primary)]">
                                Global Vision
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Our collections bridge cultures, uniting heritage and modernity in every design.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="max-w-6xl mx-auto px-6 py-24 text-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
                    <div>
                        <h3 className="text-5xl font-bold text-[var(--brand-primary)] mb-2">
                            10+
                        </h3>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Years of Excellence
                        </p>
                    </div>
                    <div>
                        <h3 className="text-5xl font-bold text-[var(--brand-secondary)] mb-2">
                            30+
                        </h3>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Countries Reached
                        </p>
                    </div>
                    <div>
                        <h3 className="text-5xl font-bold text-[var(--brand-primary)] mb-2">
                            1M+
                        </h3>
                        <p className="text-[var(--text-secondary)] text-lg">
                            Happy Customers
                        </p>
                    </div>
                </div>
            </section>

            {/*  FOUNDER SECTION - Refined & Balanced */}
            <section className="bg-[var(--soft-gray)] py-14">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
                    {/*  Left Section */}
                    <div className="flex flex-col justify-center h-full">
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--black)] mb-3">
                            Meet Our Founder
                        </h2>
                        <div className="w-20 h-[3px] bg-[var(--green)] mb-6 rounded-full"></div>

                        <p className="text-[var(--text-secondary)] text-base md:text-lg mb-8 leading-relaxed">
                            Aisha envisioned <span className="font-semibold text-[var(--brand-primary)]">Gazaarabia </span>
                            not just as a brand, but as a movement. Her passion for culture, craftsmanship, and conscious creation
                            brings elegance to life — empowering women around the world through timeless design and meaningful stories.
                        </p>

                        {/*  Icons Row */}
                        <div className="grid grid-cols-2 gap-8 max-w-md">
                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="w-14 h-14 rounded-full border-2 border-[var(--green)] text-[var(--green)] flex items-center justify-center mb-3 shadow-sm bg-white/60 backdrop-blur-sm">
                                    <FaGem className="text-2xl" />
                                </div>
                                <h4 className="font-semibold text-[var(--black)] mb-1 text-sm uppercase tracking-wide">
                                    Our Craft
                                </h4>
                                <p className="text-[var(--text-secondary)] text-sm leading-snug">
                                    Timeless, elegant and rooted in tradition.
                                </p>
                            </div>

                            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="w-14 h-14 rounded-full border-2 border-[var(--green)] text-[var(--green)] flex items-center justify-center mb-3 shadow-sm bg-white/60 backdrop-blur-sm">
                                    <FaLeaf className="text-2xl" />
                                </div>
                                <h4 className="font-semibold text-[var(--black)] mb-1 text-sm uppercase tracking-wide">
                                    Conscious Design
                                </h4>
                                <p className="text-[var(--text-secondary)] text-sm leading-snug">
                                    Thoughtfully made to empower women.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/*  Founder Image Section */}
                    <div className="flex items-center justify-center h-full">
                        <div className="relative w-full max-w-[400px] aspect-[4/5] rounded-lg overflow-hidden shadow-xl ring-2 ring-[var(--green)] flex">
                            <Image
                                src="/images/about/founder.jpg"
                                alt="Founder"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </section>



            {/*  CTA SECTION */}
            <section className="relative py-24 text-center text-white bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl font-bold mb-4 uppercase tracking-wide">
                        Join Our Journey
                    </h2>
                    <p className="mb-8 text-lg text-gray-100 leading-relaxed">
                        Be part of a global movement redefining modest fashion with purpose,
                        elegance, and cultural pride.
                    </p>
                    <button 
                    onClick={()=>{router.push("/#signature-collection");}}
                    className="px-10 py-3 bg-white text-[var(--brand-primary)] font-semibold rounded-full hover:bg-[var(--soft-gray)] transition shadow-lg">
                        Explore Collections
                    </button>
                </div>
            </section>
        </main>
    );
}
