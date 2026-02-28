"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { FaLeaf, FaHandsHelping, FaGlobe, FaFemale } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";

/* ===== TEMP CMS DATA ===== */
const impactSections = {
    hero: {
        title: "Fashion With Purpose",
        subtitle:
            "Every Gazaarabia creation reflects our commitment to sustainability, culture, and empowering women around the world.",
        image: "/images/impact/hero.png",
    },
    commitment: {
        title: "Our Commitment",
        desc: "At Gazaarabia, we believe fashion should create a positive impact. Our approach combines timeless modest design with ethical sourcing, responsible production, and cultural preservation.",
        image: "/images/impact/c.webp",
    },
    sustainability: [
        { title: "Eco Fabrics", desc: "Organic and sustainable materials crafted for longevity.", icon: <FaLeaf /> },
        { title: "Low Impact", desc: "Responsible production methods that protect our planet.", icon: <FaGlobe /> },
        { title: "Ethical", desc: "Fair wages, safe conditions, and dignified work.", icon: <FaHandsHelping /> },
        { title: "Empowerment", desc: "Uplifting women artisans across communities.", icon: <FaFemale /> },
    ],
    stats: [
        { value: "1M+", label: "Customers Worldwide" },
        { value: "30+", label: "Countries Reached" },
        { value: "500+", label: "Artisans Supported" },
    ],
    gallery: [
        "/images/impact/g1.webp",
        "/images/impact/g2.webp",
        "/images/impact/g3.jpg",
        "/images/impact/g4.webp",
        "/images/impact/g5.jpg",
        "/images/impact/g6.jpg",
        "/images/impact/g7.webp",
        "/images/impact/g8.webp",
        "/images/impact/g9.webp",
        "/images/impact/g10.webp",
    ],
    video: { title: "Our Story in Motion", url: "https://www.youtube.com/embed/yJD5VZG2cmI" },
    slider: [
        { title: "Women Empowerment", slug: "women-empowerment", desc: "Supporting artisans worldwide through fair trade and recognition.", image: "/images/impact/s1.webp" },
        { title: "Sustainable Fashion", slug: "sustainable-fashion", desc: "Eco-friendly production processes at every step.", image: "/images/impact/s2.webp" },
        { title: "Cultural Heritage", slug: "cultural-heritage", desc: "Preserving craft traditions passed down through generations.", image: "/images/impact/s3.jpg" },
        { title: "Global Reach", slug: "global-reach", desc: "Connecting artisans with conscious consumers everywhere.", image: "/images/impact/s4.webp" },
    ],
};

/* ===== ANIMATED COUNTER ===== */
function AnimatedCounter({ target, duration = 2000 }:any) {
    const [count, setCount] = useState("0");
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        const numericTarget = parseInt(target.replace(/\D/g, ""));
        const suffix = target.replace(/[\d]/g, "");
        let start = 0;
        const step = numericTarget / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= numericTarget) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start) + suffix);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return <span ref={ref}>{count}</span>;
}

/* ===== MARQUEE ===== */
function Marquee({ items }:any) {
    return (
        <div className="overflow-hidden py-4 border-y border-[#c9a84c]/30">
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="flex gap-16 whitespace-nowrap"
            >
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="text-sm tracking-[0.3em] uppercase text-[#c9a84c]/70 font-medium">
                        {item} <span className="mx-6 text-[#c9a84c]/30">✦</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/* ===== SECTION HEADING ===== */
function SectionHeading({ label, title, light = false }:any) {
    return (
        <div className="mb-14">
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`text-xs tracking-[0.4em] uppercase mb-3 font-semibold ${light ? "text-[#c9a84c]" : "text-[#2d7a4f]"}`}
            >
                {label}
            </motion.p>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className={`text-4xl md:text-5xl font-bold leading-tight ${light ? "text-white" : "text-[#1a1a1a]"}`}

            >
                {title}
            </motion.h2>
            <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mt-5 h-px w-16 bg-[#c9a84c] origin-left"
            />
        </div>
    );
}

export default function ImpactPage() {
    const router = useRouter();
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <>
            <style>{`
      
        * { box-sizing: border-box; }

        .gold-text {
          background: linear-gradient(135deg, #c9a84c 0%, #f0d080 50%, #c9a84c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .emerald-gold-text {
          background: linear-gradient(90deg, #2d7a4f 0%, #c9a84c 50%, #2d7a4f 100%);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .float { animation: float 6s ease-in-out infinite; }

        .card-hover {
          transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.4s ease;
        }
        .card-hover:hover {
          transform: translateY(-10px);
          box-shadow: 0 30px 60px -10px rgba(45,122,79,0.18);
        }

        .noise-overlay::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }

        .gallery-img {
          transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .gallery-img:hover {
          transform: scale(1.08);
        }

        .stat-card {
          border: 1px solid rgba(201,168,76,0.2);
          background: linear-gradient(135deg, rgba(201,168,76,0.05) 0%, rgba(45,122,79,0.05) 100%);
        }
      `}</style>

            <main className="bg-[#faf9f6] text-[#1a1a1a] overflow-x-hidden">

                {/* ═══ HERO ═══ */}
                <section ref={heroRef} className="relative w-full h-screen flex items-center justify-center overflow-hidden noise-overlay">
                    <motion.div style={{ y: heroY }} className="absolute inset-0">
                        <Image src={impactSections.hero.image} alt="Gazaarabia Impact" fill className="object-cover" priority />
                    </motion.div>
                    {/* Layered overlays */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#2d7a4f]/30 via-transparent to-[#2d7a4f]/30" />

                    {/* Decorative lines */}
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 h-40 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/50 to-transparent hidden md:block" />
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 h-40 w-px bg-gradient-to-b from-transparent via-[#c9a84c]/50 to-transparent hidden md:block" />

                    <motion.div
                        style={{ opacity: heroOpacity }}
                        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
                    >
                        <motion.p
                            initial={{ opacity: 0, letterSpacing: "0.1em" }}
                            animate={{ opacity: 1, letterSpacing: "0.4em" }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="text-xs uppercase text-[#c9a84c] mb-6 font-medium"
                        >
                            Gazaarabia — Est. Since Day One
                        </motion.p>

                        <motion.h1
                            initial={{ opacity: 0, y: 60, skewY: 3 }}
                            animate={{ opacity: 1, y: 0, skewY: 0 }}
                            transition={{ duration: 1, delay: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="text-5xl md:text-7xl font-bold mb-8 leading-tight emerald-gold-text"

                        >
                            {impactSections.hero.title}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.7 }}
                            className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto font-light"
                        >
                            {impactSections.hero.subtitle}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="mt-12 flex items-center justify-center gap-4"
                        >
                            <div className="h-px w-12 bg-[#c9a84c]/60" />
                            <span className="text-[#c9a84c]/80 text-sm tracking-widest uppercase">Scroll to Explore</span>
                            <div className="h-px w-12 bg-[#c9a84c]/60" />
                        </motion.div>

                        {/* Scroll indicator */}
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="mt-6 flex justify-center"
                        >
                            <div className="w-6 h-10 rounded-full border-2 border-[#c9a84c]/50 flex justify-center pt-2">
                                <div className="w-1 h-2 bg-[#c9a84c]/70 rounded-full" />
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ═══ MARQUEE ═══ */}
                <Marquee items={["Sustainable Fashion", "Women Empowerment", "Ethical Sourcing", "Cultural Heritage", "Eco Materials", "Global Impact"]} />

                {/* ═══ COMMITMENT ═══ */}
                <section className="max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <SectionHeading label="Who We Are" title={impactSections.commitment.title} />
                        <p className="text-[#5a5a5a] leading-relaxed text-lg font-light">
                            {impactSections.commitment.desc}
                        </p>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 }}
                            className="mt-10 inline-flex items-center gap-3 text-[#2d7a4f] font-semibold text-sm tracking-wider uppercase cursor-pointer group"
                        >
                            <span>Learn More</span>
                            <span className="w-8 h-px bg-[#2d7a4f] transition-all group-hover:w-16" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                        className="relative"
                    >
                        <div className="relative h-[480px] rounded-2xl overflow-hidden">
                            <Image src={impactSections.commitment.image} alt="Commitment" fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>
                        {/* Floating accent card */}
                        <motion.div
                            className="float absolute -bottom-6 -left-8 bg-white rounded-xl shadow-2xl p-6 max-w-[200px] border-l-4 border-[#c9a84c]"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="text-2xl font-bold text-[#2d7a4f]" >Since 2015</div>
                            <div className="text-xs text-[#888] mt-1 uppercase tracking-wider">Crafting with Purpose</div>
                        </motion.div>
                        {/* Gold accent blob */}
                        <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[#c9a84c]/15 blur-xl" />
                    </motion.div>
                </section>

                {/* ══════════════════════════════════════
                   SUSTAINABILITY — dark section, icon cards
               ══════════════════════════════════════ */}
                <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #0d1f16 100%)" }}>
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: "linear-gradient(rgba(232,44,63,0.8) 1px, transparent 1px), linear-gradient(to right, rgba(232,44,63,0.8) 1px, transparent 1px)",
                        backgroundSize: "55px 55px"
                    }} />
                    <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, #E82C3F, #009639, transparent)" }} />
                    <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, #009639, #E82C3F, transparent)" }} />
                    <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: "rgba(232,44,63,0.25)" }} />
                    <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: "rgba(0,150,57,0.25)" }} />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <SectionHeading label="Our Values" title="Sustainability at Our Core" light center />
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {impactSections.sustainability.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                    whileHover={{ y: -10, scale: 1.02 }}
                                    className="relative p-8 rounded-2xl overflow-hidden group cursor-default"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        backdropFilter: "blur(12px)"
                                    }}
                                >
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg, rgba(232,44,63,0.1), transparent)" : "linear-gradient(135deg, rgba(0,150,57,0.1), transparent)" }}
                                    />

                                    <div
                                        className="relative z-10 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-xl transition-all duration-500 group-hover:scale-110"
                                        style={{
                                            background: i % 2 === 0 ? "rgba(232,44,63,0.18)" : "rgba(0,150,57,0.18)",
                                            color: i % 2 === 0 ? "#E82C3F" : "#009639"
                                        }}
                                    >
                                        {item.icon}
                                    </div>

                                    <h3 className="text-white font-bold text-xl mb-3 relative z-10" >{item.title}</h3>
                                    <p className="text-white/40 text-sm leading-relaxed relative z-10">{item.desc}</p>

                                    <div className="mt-6 relative z-10">
                                        <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                                        <div className="h-px w-0 group-hover:w-full transition-all duration-700 -mt-px" style={{ background: i % 2 === 0 ? "#E82C3F" : "#009639" }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ STATS ═══ */}
                {/* <section className="py-28 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#2d7a4f]/5 blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <SectionHeading label="Our Reach" title="Numbers That Matter" />
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {impactSections.stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                  className="stat-card rounded-2xl p-10 text-center card-hover"
                >
                  <h3 className="text-5xl md:text-6xl font-bold gold-text mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    <AnimatedCounter target={stat.value} />
                  </h3>
                  <div className="w-8 h-px bg-[#c9a84c]/50 mx-auto mb-3" />
                  <p className="text-[#888] uppercase tracking-widest text-xs">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section> */}

                {/* ══════════════════════════════════════
                    STATS — alternating red/green, counter animation
                ══════════════════════════════════════ */}
                <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(180deg, #fafaf8 0%, #f5f0e8 100%)" }}>
                    <div
                        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                        style={{ fontSize: "20vw", fontWeight: 700, color: "rgba(232,44,63,0.03)", lineHeight: 1 }}
                    >
                        IMPACT
                    </div>

                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <SectionHeading label="Our Reach" title="Numbers That Matter" center />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6">
                            {impactSections.stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                    whileHover={{ y: -7 }}
                                    className="relative group text-center p-10 rounded-3xl bg-white overflow-hidden"
                                    style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 24px rgba(0,0,0,0.05)" }}
                                >
                                    {/* Top stripe */}
                                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: i % 2 === 0 ? "linear-gradient(90deg, #E82C3F, #C32230)" : "linear-gradient(90deg, #009639, #007A2D)" }} />

                                    {/* Hover bg */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg, rgba(232,44,63,0.03), transparent)" : "linear-gradient(135deg, rgba(0,150,57,0.03), transparent)" }}
                                    />

                                    <div
                                        className="text-6xl md:text-7xl font-bold mb-2 relative z-10"
                                        style={{

                                            background: i % 2 === 0 ? "linear-gradient(135deg, #E82C3F, #C32230)" : "linear-gradient(135deg, #009639, #007A2D)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text"
                                        }}
                                    >
                                        <AnimatedCounter target={stat.value} />
                                    </div>

                                    <div className="mx-auto mb-3 h-0.5 w-10 rounded-full relative z-10" style={{ background: i % 2 === 0 ? "#E82C3F" : "#009639" }} />
                                    <p className="text-[#999] text-xs uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ GALLERY ═══ */}
                <section className="py-28 bg-[#f4f1eb]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex items-end justify-between mb-14">
                            <SectionHeading label="Visual Stories" title="Impact Gallery" />
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                className="text-xs tracking-widest uppercase text-[#888] hidden md:block mb-14"
                            >
                                Moments of Purpose
                            </motion.span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {impactSections.gallery.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.92 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.07, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                                    className={`relative overflow-hidden rounded-xl group cursor-pointer ${i === 0 || i === 5 ? "md:row-span-2 h-[300px] md:h-full" : "h-[200px]"}`}
                                    style={{ minHeight: i === 0 || i === 5 ? "400px" : "200px" }}
                                >
                                    <Image src={img} alt="Impact" fill className="object-cover gallery-img" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    {/* <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="text-white text-xs tracking-widest uppercase">View Story</span>
                  </div> */}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══ VIDEO ═══ */}
                {/* <section className="py-28 px-6" style={{ background: "linear-gradient(180deg, #faf9f6 0%, #f0ece3 100%)" }}>
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-12">
                            <SectionHeading label="Behind The Scenes" title={impactSections.video.title} />
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 40, scale: 0.97 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                            className="relative"
                        >
                           
                            <div className="absolute -inset-3 rounded-3xl border border-[#c9a84c]/20" />
                            <div className="absolute -inset-6 rounded-3xl border border-[#c9a84c]/10" />

                            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
                                <iframe
                                    src={impactSections.video.url}
                                    className="w-full h-full"
                                    allowFullScreen
                                    title="Gazaarabia Story"
                                />
                            </div>
                        </motion.div>
                    </div>
                </section> */}

                  {/* ══════════════════════════════════════
                            VIDEO — centered with decorative rings
                        ══════════════════════════════════════ */}
                        <section className="py-28 px-6 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #fafaf8 0%, #f0ebe0 100%)" }}>
                          <div className="absolute top-10 left-10 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,44,63,0.12), transparent 70%)", filter: "blur(32px)" }} />
                          <div className="absolute bottom-10 right-10 w-56 h-56 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(0,150,57,0.12), transparent 70%)", filter: "blur(32px)" }} />
                
                          <div className="max-w-5xl mx-auto relative z-10">
                            <div className="text-center mb-14">
                              <SectionHeading label="Behind The Scenes" title={impactSections.video.title} center />
                              <motion.p
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className="text-[#888] text-sm mt-4 max-w-md mx-auto leading-relaxed"
                              >
                                Watch how our values come to life — from fabric to finished piece, every step with intention.
                              </motion.p>
                            </div>
                
                            <motion.div
                              initial={{ opacity: 0, y: 50, scale: 0.96 }}
                              whileInView={{ opacity: 1, y: 0, scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                              className="relative"
                            >
                              <div className="absolute -inset-4 rounded-[28px] border opacity-25" style={{ borderColor: "#E82C3F" }} />
                              <div className="absolute -inset-8 rounded-[34px] border opacity-12" style={{ borderColor: "#009639" }} />
                
                              <div className="relative w-full aspect-video rounded-3xl overflow-hidden" style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.18)" }}>
                                <iframe src={impactSections.video.url} className="w-full h-full" allowFullScreen title="Gazaarabia Story" />
                              </div>
                
                              <div className="absolute -right-14 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2">
                                <div className="w-px h-14 bg-[#E82C3F]/25" />
                                <span className="text-[10px] tracking-[0.3em] uppercase text-[#E82C3F]/40" style={{ writingMode: "vertical-rl" }}>Watch Now</span>
                                <div className="w-px h-14 bg-[#009639]/25" />
                              </div>
                            </motion.div>
                          </div>
                        </section>

                {/* ═══ INITIATIVES ═══ */}
                <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #faf9f6 0%, #f2ede4 100%)" }}>
                    {/* Subtle grid texture */}
                    <div className="absolute inset-0 opacity-[0.025]" style={{
                        backgroundImage: "repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 1px, transparent 1px, transparent 60px)"
                    }} />
                    {/* Ambient orbs */}
                    <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,44,63,0.06) 0%, transparent 70%)" }} />
                    <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(11,86,54,0.06) 0%, transparent 70%)" }} />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        {/* Header with counter */}
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
                            <SectionHeading label="What We Do" title="Our Initiatives" />
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 mb-14"
                            >
                                <span className="text-3xl font-bold text-[#E82C3F]">
                                    {impactSections.slider.length}
                                </span>
                                <div className="w-px h-8 bg-[#ddd]" />
                                <span className="text-xs uppercase tracking-widest text-[#999]">Active Programs</span>
                            </motion.div>
                        </div>

                        {/* Alternating cards */}
                        <div className="space-y-6">
                            {impactSections.slider.map((item, i) => {
                                const isEven = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-80px" }}
                                        transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
                                        className="group relative"
                                        onClick={() => router.push(`/impact/${item.slug}`)}
                                    >
                                        <div
                                            className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-shadow duration-500`}
                                            style={{ border: "1px solid rgba(0,0,0,0.05)" }}
                                        >
                                            {/* Image side */}
                                            <div className="relative md:w-[42%] h-[260px] md:h-auto overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#E82C3F]/0 to-[#0B5636]/0 group-hover:from-[#E82C3F]/20 group-hover:to-[#0B5636]/30 transition-all duration-700" />
                                                {/* Number badge */}
                                                <div
                                                    className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                                                    style={{ background: "linear-gradient(135deg, #E82C3F, #C32230)" }}
                                                >
                                                    {String(i + 1).padStart(2, "0")}
                                                </div>
                                            </div>

                                            {/* Content side */}
                                            <div className="flex-1 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden">
                                                {/* Hover glow */}
                                                <div
                                                    className={`absolute ${isEven ? "-right-16" : "-left-16"} top-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl transition-opacity duration-700 opacity-0 group-hover:opacity-100`}
                                                    style={{ background: "radial-gradient(circle, rgba(11,86,54,0.08) 0%, transparent 70%)" }}
                                                />

                                                {/* Label */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-[#E82C3F]" />
                                                    <span className="text-xs uppercase tracking-[0.3em] text-[#E82C3F] font-semibold">Initiative</span>
                                                </div>

                                                {/* Title */}
                                                <h3
                                                    className="text-2xl md:text-3xl font-bold text-[#1a1a1a] mb-3 leading-tight group-hover:text-[#0B5636] transition-colors duration-500"

                                                >
                                                    {item.title}
                                                </h3>

                                                {/* Animated underline */}
                                                <div className="w-10 h-0.5 bg-[#E82C3F] mb-5 group-hover:w-20 transition-all duration-500" />

                                                <p className="text-[#666] leading-relaxed text-base mb-8">{item.desc}</p>

                                                {/* CTA row */}
                                                <div className="flex items-center justify-between">
                                                    <motion.div whileHover={{ x: 6 }} className="inline-flex items-center gap-3 cursor-pointer">
                                                        <span
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm shadow-md group-hover:scale-110 transition-transform duration-300"
                                                            style={{ background: "linear-gradient(135deg, #0B5636, #009639)" }}
                                                        >
                                                            →
                                                        </span>
                                                        <span className="text-xs uppercase tracking-widest text-[#0B5636] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                            Learn More
                                                        </span>
                                                    </motion.div>
                                                    {/* Decorative dots */}
                                                    <div className="hidden md:flex gap-1.5">
                                                        {[0, 1, 2].map(d => (
                                                            <div
                                                                key={d}
                                                                className="w-1.5 h-1.5 rounded-full bg-[#e0e0e0] group-hover:bg-[#009639] transition-colors duration-300"
                                                                style={{ transitionDelay: `${d * 80}ms` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Connector between cards */}
                                        {i < impactSections.slider.length - 1 && (
                                            <div className="hidden md:flex justify-center my-1">
                                                <motion.div
                                                    initial={{ scaleY: 0 }}
                                                    whileInView={{ scaleY: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.4, delay: 0.3 }}
                                                    className="w-px h-6 bg-gradient-to-b from-[#E82C3F]/30 to-[#009639]/30 origin-top"
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══ CTA ═══ */}
                <section className="py-12 md:py-16 text-white text-center bg-gradient-to-r from-[#0B5636] via-[#5E4A42] to-[#B1333A]">
                    <div className="max-w-3xl mx-auto px-6">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-3xl font-bold mb-4"
                        >
                            Join The Movement
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-white/90 mb-6 text-base md:text-lg"
                        >
                            Partner with Gazaarabia and be part of a global movement that honors culture, empowers communities, and protects our planet.
                        </motion.p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => router.push("/become-partner")}
                            className="inline-block bg-white text-[#0B5636] px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold shadow hover:shadow-lg"
                        >
                            Collaborate With Us
                        </motion.button>
                    </div>
                </section>

            </main>
        </>
    );
}