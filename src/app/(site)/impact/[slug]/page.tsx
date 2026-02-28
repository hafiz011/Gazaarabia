"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";

/* ===== TEMP DATA ===== */
const initiatives = {
    "women-empowerment": {
        title: "Empowering Women Through Craft & Opportunity",
        eyebrow: "Women Empowerment",
        hero: "/images/impact/s1.webp",
        desc: "At Gazaarabia, we partner with women artisans across communities, offering skill development, fair wages, and long-term financial independence.",
        longDesc: "Our women empowerment program was born from a simple belief: that when a woman earns with dignity, her entire community thrives. We work directly with artisan cooperatives, providing training, tools, and guaranteed market access so that craft becomes a sustainable livelihood — not a struggle.",
        stats: [
            { value: "500+", label: "Artisans Supported" },
            { value: "20+", label: "Communities" },
            { value: "80%", label: "Income Growth" },
        ],
        gallery: [
            "/images/impact/g1.webp",
            "/images/impact/g3.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g8.webp",
            "/images/impact/g7.webp",
            "/images/impact/g8.webp",
            "/images/impact/g9.webp",
            "/images/impact/g5.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g2.webp",
        ],
        highlights: [
            "Direct fair-trade partnerships with 20+ cooperatives",
            "Free skill development & certification programs",
            "Long-term contracts ensuring income stability",
        ],
    },
    "sustainable-fashion": {
        title: "Sustainability at the Heart of Every Design",
        eyebrow: "Sustainable Fashion",
        hero: "/images/impact/s2.webp",
        desc: "We focus on eco-friendly fabrics, ethical production, and low-impact processes to protect our planet while creating luxury modest fashion.",
        longDesc: "Sustainability isn't a buzzword for us — it's a founding principle. From the fields where our organic cotton grows to the workshops where our artisans craft each piece, every decision is made with the planet in mind.",
        stats: [
            { value: "70%", label: "Eco Materials" },
            { value: "40%", label: "Waste Reduced" },
            { value: "100%", label: "Ethical Sourcing" },
        ],
        gallery: [
           "/images/impact/g1.webp",
            "/images/impact/g3.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g8.webp",
            "/images/impact/g7.webp",
            "/images/impact/g8.webp",
            "/images/impact/g9.webp",
            "/images/impact/g5.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g2.webp",
        ],
        highlights: [
            "GOTS-certified organic and recycled fabrics",
            "Zero-waste pattern cutting across all product lines",
            "Carbon-offset shipping on every order worldwide",
        ],
    },
    "cultural-heritage": {
        title: "Preserving Craft Traditions Passed Down Through Generations",
        eyebrow: "Cultural Heritage",
        hero: "/images/impact/s3.jpg",
        desc: "We document, celebrate, and revive ancient textile traditions, ensuring they are passed forward with pride and integrity.",
        longDesc: "Every embroidery pattern, every weave structure, every dye technique carries centuries of knowledge. Our cultural heritage initiative works with elders, researchers, and young artisans to ensure these traditions survive — and thrive.",
        stats: [
            { value: "12+", label: "Heritage Crafts" },
            { value: "3", label: "Countries" },
            { value: "200+", label: "Documented Techniques" },
        ],
        gallery: [
           "/images/impact/g1.webp",
            "/images/impact/g3.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g8.webp",
            "/images/impact/g7.webp",
            "/images/impact/g8.webp",
            "/images/impact/g9.webp",
            "/images/impact/g5.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g2.webp",
        ],
        highlights: [
            "Archive of 200+ documented traditional techniques",
            "Youth apprenticeship programs with master artisans",
            "Annual cultural showcase events in 3 countries",
        ],
    },
    "global-reach": {
        title: "Connecting Artisans With Conscious Consumers Everywhere",
        eyebrow: "Global Reach",
        hero: "/images/impact/s4.webp",
        desc: "Gazaarabia bridges the gap between skilled artisans and global markets, ensuring every creation finds a home and every maker earns fair recognition.",
        longDesc: "Our global reach program removes the barriers between talented makers and the world stage. Through digital platforms, international partnerships, and our own curated marketplace, we connect artisans in 30+ countries with customers who value intentional, ethical fashion.",
        stats: [
            { value: "30+", label: "Countries" },
            { value: "1M+", label: "Customers" },
            { value: "95%", label: "Repeat Buyers" },
        ],
        gallery: [
           "/images/impact/g1.webp",
            "/images/impact/g3.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g8.webp",
            "/images/impact/g7.webp",
            "/images/impact/g8.webp",
            "/images/impact/g9.webp",
            "/images/impact/g5.jpg",
            "/images/impact/g6.jpg",
            "/images/impact/g2.webp",
        ],
        highlights: [
            "Direct-to-consumer sales in 30+ countries worldwide",
            "Multilingual platform supporting 8 languages",
            "Artisan profiles giving makers global visibility",
        ],
    },
};

/* ===== ANIMATED COUNTER ===== */
function AnimatedCounter({ target, duration = 2000 }: { target: string; duration?: number }) {
    const [count, setCount] = useState("0");
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        const numeric = parseInt(target.replace(/\D/g, ""));
        const suffix = target.replace(/[\d]/g, "");
        let start = 0;
        const step = numeric / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= numeric) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start) + suffix);
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    return <span ref={ref}>{count}</span>;
}

/* ===== MARQUEE — identical to ImpactPage ===== */
function Marquee({ items }: { items: string[] }) {
    return (
        <div className="overflow-hidden py-4 border-y" style={{ borderColor: "rgba(232,44,63,0.15)", background: "rgba(232,44,63,0.02)" }}>
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="flex gap-16 whitespace-nowrap"
            >
                {[...items, ...items].map((item, i) => (
                    <span key={i} className="inline-flex items-center gap-6 text-xs tracking-[0.3em] uppercase font-semibold" style={{ color: "#E82C3F", opacity: 0.6 }}>
                        {item} <span style={{ color: "#009639", opacity: 0.5 }}>✦</span>
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/* ===== SECTION HEADING — identical to ImpactPage ===== */
function SectionHeading({ label, title, light = false, center = false }: { label: string; title: string; light?: boolean; center?: boolean }) {
    return (
        <div className={`mb-10 ${center ? "text-center" : ""}`}>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`inline-flex items-center gap-3 mb-4 ${center ? "justify-center w-full" : ""}`}
            >
                <div className="w-4 h-px bg-[#E82C3F]" />
                <span className="text-xs tracking-[0.4em] uppercase font-bold" style={{ color: light ? "rgba(255,255,255,0.55)" : "#E82C3F" }}>{label}</span>
                <div className="w-4 h-px bg-[#E82C3F]" />
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
                className="text-4xl md:text-5xl font-bold leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: light ? "#fff" : "#111" }}
            >
                {title}
            </motion.h2>
            <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className={`mt-4 h-[3px] w-14 rounded-full ${center ? "mx-auto" : ""}`}
                style={{ background: "linear-gradient(90deg, #E82C3F, #009639)", transformOrigin: center ? "center" : "left" }}
            />
        </div>
    );
}

export default function InitiativePage() {
    const { slug } = useParams();
    const router = useRouter();
    const heroRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
    const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

    const data = initiatives[slug as keyof typeof initiatives];

    if (!data) return (
        <div className="min-h-screen flex items-center justify-center bg-[#fafaf8]">
            <div className="text-center">
                <p className="text-7xl font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#E82C3F" }}>404</p>
                <p className="text-[#888] text-sm uppercase tracking-widest">Initiative not found</p>
            </div>
        </div>
    );

    const otherInitiatives = Object.entries(initiatives).filter(([key]) => key !== slug);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Jost:wght@300;400;500;600&display=swap');

                * { box-sizing: border-box; }
                body { font-family: 'Jost', sans-serif; }

                .emerald-gold-text {
                    background: linear-gradient(90deg, #E82C3F 0%, #C32230 30%, #009639 70%, #007A2D 100%);
                    background-size: 200% auto;
                    animation: shimmer 4s linear infinite;
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

                .gallery-img {
                    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }
                .gallery-img:hover { transform: scale(1.08); }

                .noise-overlay::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>

            <main className="bg-[#faf9f6] text-[#1a1a1a] overflow-x-hidden" style={{ fontFamily: "'Jost', sans-serif" }}>

                {/* ═══════════════════════════════════════
                    HERO — parallax, left-bottom aligned
                ═══════════════════════════════════════ */}
                <section
                    ref={heroRef}
                    className="relative w-full h-screen flex items-center justify-center overflow-hidden noise-overlay"
                >
                    {/* Background */}
                    <motion.div style={{ y: heroY }} className="absolute inset-0">
                        <Image
                            src={data.hero}
                            alt={data.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    </motion.div>

                    {/* Dark luxury overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/85" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B5636]/30 via-transparent to-[#0B5636]/30" />

                    {/* Subtle texture */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage:
                            "url('data:image/svg+xml,%3Csvg viewBox=\\'0 0 256 256\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noise\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.9\\' numOctaves=\\'4\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noise)\\'/%3E%3C/svg%3E')",
                    }} />

                    {/* Content */}
                    <motion.div
                        style={{ opacity: heroOpacity }}
                        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
                    >
                        {/* Soft luxury label */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mb-6"
                        >
                            {/* <span className="text-xs uppercase tracking-[0.35em] text-white/60">
        Impact Initiative
      </span> */}
                            {/* Eyebrow pill */}
                            <motion.div
                                initial={{ opacity: 0, x: -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.9, delay: 0.5 }}
                                className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest"
                                style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)", background: "rgba(255,255,255,0.05)" }}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-[#E82C3F]" />
                                Gazaarabia Initiative
                            </motion.div>
                        </motion.div>

                        {/* Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 60, skewY: 2 }}
                            animate={{ opacity: 1, y: 0, skewY: 0 }}
                            transition={{ duration: 1, delay: 0.5, ease: [0.23, 1, 0.32, 1] }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 emerald-gold-text"
                            style={{ fontFamily: "'Cormorant Garamond', serif" }}
                        >
                            {data.title}
                        </motion.h1>

                        {/* Short emotional description */}
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, delay: 0.8 }}
                            className="text-white/75 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light"
                        >
                            {data.desc}
                        </motion.p>

                        {/* Elegant divider */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1.1, duration: 0.7 }}
                            className="mt-10 mx-auto h-px w-16 bg-[#c9a84c]"
                        />

                        {/* Scroll indicator */}
                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ duration: 1.6, repeat: Infinity }}
                            className="mt-10 flex justify-center"
                        >
                            <div className="w-6 h-10 rounded-full border-2 border-[#c9a84c]/50 flex justify-center pt-2">
                                <div className="w-1 h-2 bg-[#c9a84c]/70 rounded-full" />
                            </div>
                        </motion.div>
                    </motion.div>
                </section>

                {/* ═══ MARQUEE — same as ImpactPage ═══ */}
                <Marquee items={["Sustainable Fashion", "Women Empowerment", "Ethical Sourcing", "Cultural Heritage", "Eco Materials", "Global Impact"]} />

                {/* ═══════════════════════════════════════
                    STORY — split layout, same as Commitment
                ═══════════════════════════════════════ */}
                <section className="relative overflow-hidden py-28">
                    {/* Watermark — same treatment as ImpactPage */}
                    <div
                        className="absolute -top-4 -right-4 select-none pointer-events-none font-bold leading-none"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(100px, 14vw, 180px)", color: "rgba(232,44,63,0.035)" }}
                    >
                        STORY
                    </div>

                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 lg:gap-24 items-start relative z-10">
                        {/* Left: narrative */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                        >
                            <SectionHeading label="The Mission" title="Behind The Movement" />
                            <p className="text-[#5a5a5a] leading-[1.9] text-base mb-5 font-light">{data.desc}</p>
                            <p className="text-[#666] leading-[1.9] text-base">{data.longDesc}</p>

                            <motion.button
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => router.push("/become-partner")}
                                className="mt-10 inline-flex items-center gap-3 px-8 py-3 rounded-full text-white text-sm font-semibold tracking-wide shadow-lg"
                                style={{ background: "linear-gradient(135deg, #E82C3F, #C32230)" }}
                            >
                                Get Involved
                                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">→</span>
                            </motion.button>
                        </motion.div>

                        {/* Right: highlights — same card pattern as Initiatives section */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
                            className="space-y-4 mt-4 md:mt-16"
                        >
                            {data.highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12 }}
                                    className="group flex items-start gap-5 p-6 rounded-2xl bg-white hover:shadow-xl transition-all duration-500 cursor-default"
                                    style={{ border: "1px solid rgba(0,0,0,0.05)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
                                >
                                    {/* Number badge — same as initiatives cards */}
                                    <div
                                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform duration-300"
                                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg, #E82C3F, #C32230)" : "linear-gradient(135deg, #009639, #007A2D)" }}
                                    >
                                        {String(i + 1).padStart(2, "0")}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[#333] text-sm leading-relaxed font-medium">{h}</p>
                                        <div className="mt-3 h-0.5 w-6 group-hover:w-14 transition-all duration-500 rounded-full" style={{ background: i % 2 === 0 ? "#E82C3F" : "#009639" }} />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Floating metric — same float animation as Commitment section */}
                            <motion.div
                                className="float mt-2 p-6 rounded-2xl text-white relative overflow-hidden"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.45 }}
                                style={{ background: "linear-gradient(135deg, #0B5636, #009639)" }}
                            >
                                <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }} />
                                <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
                                <p className="text-white/55 text-xs uppercase tracking-widest mb-2 relative z-10">Impact Since 2015</p>
                                <p className="text-3xl font-bold relative z-10" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{data.stats[0].value}</p>
                                <p className="text-white/65 text-sm mt-1 relative z-10">{data.stats[0].label}</p>
                                <div className="mt-4 h-px relative z-10" style={{ background: "rgba(255,255,255,0.2)" }} />
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════
                    STATS — same dark section as ImpactPage
                ═══════════════════════════════════════ */}
                <section className="relative py-28 overflow-hidden" style={{ background: "linear-gradient(135deg, #111 0%, #1a1a1a 50%, #0d1f16 100%)" }}>
                    {/* Identical treatments from ImpactPage */}
                    <div className="absolute inset-0 opacity-[0.04]" style={{
                        backgroundImage: "linear-gradient(rgba(232,44,63,0.8) 1px, transparent 1px), linear-gradient(to right, rgba(232,44,63,0.8) 1px, transparent 1px)",
                        backgroundSize: "55px 55px"
                    }} />
                    <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, #E82C3F, #009639, transparent)" }} />
                    <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, #009639, #E82C3F, transparent)" }} />
                    <div className="absolute top-8 left-8 w-20 h-20 border-l-2 border-t-2 rounded-tl-2xl" style={{ borderColor: "rgba(232,44,63,0.25)" }} />
                    <div className="absolute bottom-8 right-8 w-20 h-20 border-r-2 border-b-2 rounded-br-2xl" style={{ borderColor: "rgba(0,150,57,0.25)" }} />

                    <div
                        className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
                        style={{ fontSize: "18vw", fontWeight: 700, color: "rgba(255,255,255,0.02)", lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}
                    >
                        NUMBERS
                    </div>

                    <div className="max-w-6xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <SectionHeading label="By The Numbers" title="Real Impact, Real Results" light center />
                        </div>

                        <div className="grid sm:grid-cols-3 gap-6">
                            {data.stats.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15, duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                                    whileHover={{ y: -7, scale: 1.02 }}
                                    className="relative group text-center p-10 rounded-3xl overflow-hidden cursor-default"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                                        border: "1px solid rgba(255,255,255,0.07)",
                                        backdropFilter: "blur(12px)"
                                    }}
                                >
                                    {/* Top stripe */}
                                    <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: i % 2 === 0 ? "linear-gradient(90deg, #E82C3F, #C32230)" : "linear-gradient(90deg, #009639, #007A2D)" }} />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                        style={{ background: i % 2 === 0 ? "linear-gradient(135deg, rgba(232,44,63,0.1), transparent)" : "linear-gradient(135deg, rgba(0,150,57,0.1), transparent)" }}
                                    />

                                    <div
                                        className="text-6xl md:text-7xl font-bold mb-2 relative z-10"
                                        style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            background: i % 2 === 0 ? "linear-gradient(135deg, #E82C3F, #C32230)" : "linear-gradient(135deg, #009639, #007A2D)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text"
                                        }}
                                    >
                                        <AnimatedCounter target={stat.value} />
                                    </div>
                                    <div className="mx-auto mb-3 h-0.5 w-10 rounded-full relative z-10" style={{ background: i % 2 === 0 ? "#E82C3F" : "#009639" }} />
                                    <p className="text-white/40 text-xs uppercase tracking-[0.2em] relative z-10">{stat.label}</p>
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
                            {data.gallery.map((img, i) => (
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

                {/* ═══════════════════════════════════════
                    OTHER INITIATIVES — same alternating card style
                ═══════════════════════════════════════ */}
                <section className="py-28 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #faf9f6 0%, #f2ede4 100%)" }}>
                    <div className="absolute inset-0 opacity-[0.025]" style={{
                        backgroundImage: "repeating-linear-gradient(0deg, #1a1a1a 0px, #1a1a1a 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #1a1a1a 0px, #1a1a1a 1px, transparent 1px, transparent 60px)"
                    }} />
                    <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(232,44,63,0.06) 0%, transparent 70%)" }} />
                    <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ background: "radial-gradient(circle, rgba(11,86,54,0.06) 0%, transparent 70%)" }} />

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
                            <SectionHeading label="Explore More" title="Other Initiatives" />
                            <motion.div
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex items-center gap-3 mb-10"
                            >
                                <span className="text-4xl font-bold" style={{ fontFamily: "'Cormorant Garamond', serif", background: "linear-gradient(135deg, #E82C3F, #C32230)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    {otherInitiatives.length}
                                </span>
                                <div className="w-px h-8 bg-[#ddd]" />
                                <span className="text-xs uppercase tracking-widest text-[#aaa]">More Programs</span>
                            </motion.div>
                        </div>

                        {/* Same alternating card layout as ImpactPage initiatives */}
                        <div className="space-y-6">
                            {otherInitiatives.map(([key, item], i) => {
                                const isEven = i % 2 === 0;
                                return (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: isEven ? -60 : 60 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true, margin: "-80px" }}
                                        transition={{ duration: 0.85, ease: [0.23, 1, 0.32, 1] }}
                                        className="group relative cursor-pointer"
                                        onClick={() => router.push(`/impact/${key}`)}
                                    >
                                        <div
                                            className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-shadow duration-500`}
                                            style={{ border: "1px solid rgba(0,0,0,0.05)" }}
                                        >
                                            {/* Image side */}
                                            <div className="relative md:w-[42%] h-[220px] md:h-auto overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.hero}
                                                    alt={item.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 group-hover:opacity-100 opacity-0 transition-all duration-700" style={{ background: "linear-gradient(135deg, rgba(232,44,63,0.2), rgba(0,150,57,0.3))" }} />
                                                <div
                                                    className="absolute top-5 left-5 w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg"
                                                    style={{ background: "linear-gradient(135deg, #E82C3F, #C32230)" }}
                                                >
                                                    {String(i + 1).padStart(2, "0")}
                                                </div>
                                            </div>

                                            {/* Content side */}
                                            <div className="flex-1 p-8 md:p-10 flex flex-col justify-center relative overflow-hidden">
                                                <div className={`absolute ${isEven ? "-right-16" : "-left-16"} top-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}
                                                    style={{ background: "radial-gradient(circle, rgba(11,86,54,0.08) 0%, transparent 70%)" }}
                                                />

                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-2 h-2 rounded-full bg-[#E82C3F]" />
                                                    <span className="text-xs uppercase tracking-[0.3em] text-[#E82C3F] font-semibold">{item.eyebrow}</span>
                                                </div>

                                                <h3
                                                    className="text-xl md:text-2xl font-bold text-[#1a1a1a] mb-3 leading-tight group-hover:text-[#0B5636] transition-colors duration-500"
                                                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                                >
                                                    {item.title}
                                                </h3>

                                                <div className="h-0.5 w-10 mb-4 group-hover:w-20 transition-all duration-500" style={{ background: "linear-gradient(90deg, #E82C3F, #009639)" }} />
                                                <p className="text-[#666] leading-relaxed text-sm mb-6">{item.desc}</p>

                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm shadow-md group-hover:scale-110 transition-transform duration-300"
                                                        style={{ background: "linear-gradient(135deg, #0B5636, #009639)" }}
                                                    >
                                                        →
                                                    </span>
                                                    <span className="text-xs uppercase tracking-widest text-[#0B5636] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                        Explore Initiative
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {i < otherInitiatives.length - 1 && (
                                            <div className="hidden md:flex justify-center my-1">
                                                <motion.div
                                                    initial={{ scaleY: 0 }}
                                                    whileInView={{ scaleY: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.4, delay: 0.3 }}
                                                    className="w-px h-6 origin-top"
                                                    style={{ background: "linear-gradient(to bottom, rgba(232,44,63,0.3), rgba(0,150,57,0.3))" }}
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══ CTA — pixel-perfect match to ImpactPage ═══ */}
                <section className="py-12 md:py-16 text-white text-center bg-gradient-to-r from-[#0B5636] via-[#5E4A42] to-[#B1333A]">
                    <div className="max-w-3xl mx-auto px-6">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl md:text-3xl font-bold mb-4"
                        >
                            Join This Initiative
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-white/90 mb-6 text-base md:text-lg"
                        >
                            Collaborate, support, or become part of the change.
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