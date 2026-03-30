"use client";

import Image from "next/image";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";

/* ========================================
   HERO SECTION — Luxury Modest Fashion
   Direction: Dark editorial luxury
   Font: Playfair Display + Jost
   Palette: Deep forest + ivory + gold
======================================== */

const WORDS = ["Refined.", "Timeless.", "Elevated."];

function useMouseParallax(strength = 20) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 60, damping: 20 });
  const springY = useSpring(y, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handle = (e:any) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * strength;
      const ny = (e.clientY / window.innerHeight - 0.5) * strength;
      x.set(nx);
      y.set(ny);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [strength, x, y]);

  return { springX, springY };
}

function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-block overflow-hidden" style={{ minWidth: "260px", display: "inline-block", verticalAlign: "bottom" }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={WORDS[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="block italic text-[#c9a84c]"
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* Animated SVG decorative ring */
function DecorativeRing({ size, delay, opacity }:any) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity, scale: 1 }}
      transition={{ duration: 1.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="absolute pointer-events-none"
    >
      <motion.circle
        cx="100" cy="100" r="90"
        stroke="white"
        strokeWidth="0.6"
        strokeDasharray="10 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />
      <motion.circle
        cx="100" cy="100" r="70"
        stroke="#c9a84c"
        strokeWidth="0.4"
        animate={{ rotate: -360 }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "100px 100px" }}
      />
    </motion.svg>
  );
}

/* Floating badge */
function FloatingBadge({ delay }:any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-20 right-10 md:right-20 hidden md:flex flex-col items-center justify-center rounded-full border border-[#c9a84c]/40 bg-black/30 backdrop-blur-md"
      style={{ width: 110, height: 110 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0"
      >
        <svg viewBox="0 0 110 110" className="w-full h-full">
          <defs>
            <path id="circlePath" d="M 55,55 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text fill="#c9a84c" fontSize="9.5" letterSpacing="3.2" fontFamily="Jost, sans-serif" fontWeight="400">
            <textPath href="#circlePath">NEW COLLECTION • 2025 • MODEST LUXURY •</textPath>
          </text>
        </svg>
      </motion.div>
      <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "white", fontSize: 11 }}>✦</span>
    </motion.div>
  );
}

export default function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const { springX, springY } = useMouseParallax(14);
  const imgParallaxX = useSpring(useMotionValue(0), { stiffness: 30, damping: 15 });

  useEffect(() => {
    return springX.on("change", (v) => imgParallaxX.set(v * 0.4));
  }, [springX, imgParallaxX]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Jost:wght@200;300;400;500&display=swap');
      `}</style>

      <section
        ref={heroRef}
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: 600, background: "#060f09" }}
      >

        {/* ── BG IMAGE with parallax ── */}
        <motion.div
          style={{ y: bgY, x: imgParallaxX }}
          className="absolute inset-0 scale-[1.12]"
        >
          <Image
            src="/images/products/p4.webp"
            alt="Hero"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
        </motion.div>

        {/* ── LAYERED OVERLAYS ── */}
        {/* Dark vignette */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(4,12,7,0.92) 0%, rgba(4,12,7,0.55) 55%, rgba(4,12,7,0.25) 100%)" }} />
        {/* Bottom fade */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,12,7,0.9) 0%, transparent 45%)" }} />
        {/* Top fade */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(4,12,7,0.5) 0%, transparent 25%)" }} />
        {/* Subtle gold shimmer streak */}
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: [0, 0.07, 0] }}
          transition={{ delay: 1.5, duration: 2.5, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(105deg, transparent 30%, #c9a84c 50%, transparent 70%)" }}
        />
        {/* Noise grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* ── NAV BAR ── */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-8 md:px-16 pt-7 pb-4"
        >
          <div style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 22, letterSpacing: "0.05em", fontStyle: "italic" }}>
            Modestè
          </div>
          <div className="hidden md:flex gap-8">
            {["Shop", "Collections", "About", "Journal"].map((item, i) => (
              <motion.a
                key={item}
                href="#"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                className="relative group"
                style={{ fontFamily: "'Jost', sans-serif", color: "rgba(255,255,255,0.65)", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", textDecoration: "none" }}
              >
                {item}
                <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-[#c9a84c] transition-all duration-400 ease-out" />
              </motion.a>
            ))}
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}
            className="hidden md:block px-6 py-2.5 rounded-full border border-white/20 text-white/70 hover:border-[#c9a84c]/70 hover:text-[#c9a84c] transition-all duration-400"
          >
            My Cart (0)
          </motion.button>
        </motion.nav>

        {/* ── DECORATIVE RINGS (top-right corner) ── */}
        <div className="absolute top-16 right-12 hidden lg:block" style={{ width: 220, height: 220 }}>
          <DecorativeRing size={220} delay={1.2} opacity={0.18} />
        </div>

        {/* ── SIDE LABEL ── */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute left-7 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3 z-20"
        >
          <div style={{ writingMode: "vertical-rl", fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            Spring / Summer 2025
          </div>
          <motion.div
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-px bg-white/20 rounded-full"
            style={{ height: 48 }}
          />
        </motion.div>

        {/* ── MAIN CONTENT ── */}
        <motion.div
          style={{ y: contentY, opacity: overlayOpacity }}
          className="absolute inset-0 z-20 flex flex-col justify-center pl-8 md:pl-20 lg:pl-28 pr-8 max-w-4xl"
        >

          {/* Label */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-px bg-[#c9a84c]" />
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 11, letterSpacing: "0.28em", textTransform: "uppercase", color: "#c9a84c" }}>
              New Arrival
            </span>
          </motion.div>

          {/* Headline */}
          <div style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.0 }}>
            {["Modest.", "Luxury."].map((line, i) => (
              <div key={line} className="overflow-hidden">
                <motion.div
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: 0.6 + i * 0.15, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  style={{ fontSize: "clamp(3.8rem, 10vw, 8.5rem)", color: "white", fontWeight: 400, letterSpacing: "-0.01em" }}
                >
                  {line}
                </motion.div>
              </div>
            ))}

            {/* Rotating word */}
            <div className="overflow-hidden mt-1">
              <motion.div
                initial={{ y: "105%" }}
                animate={{ y: "0%" }}
                transition={{ delay: 0.9, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                style={{ fontSize: "clamp(3.8rem, 10vw, 8.5rem)", fontWeight: 400, letterSpacing: "-0.01em" }}
              >
                <RotatingWord />
              </motion.div>
            </div>
          </div>

          {/* Divider line */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 mb-7 h-px bg-white/10 max-w-xs"
          />

          {/* Subtext + stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.7 }}
            className="flex flex-col md:flex-row md:items-end gap-6 md:gap-16"
          >
            <p style={{ fontFamily: "'Jost', sans-serif", color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.75, maxWidth: 280, fontWeight: 300, letterSpacing: "0.03em" }}>
              Thoughtfully crafted pieces that honour faith, femininity, and quiet elegance — designed to be worn and remembered.
            </p>
            <div className="flex gap-8">
              {[["200+", "Styles"], ["100%", "Ethical"], ["42", "Countries"]].map(([num, label]) => (
                <div key={label} className="flex flex-col">
                  <span style={{ fontFamily: "'Playfair Display', serif", color: "white", fontSize: 22, fontWeight: 500 }}>{num}</span>
                  <span style={{ fontFamily: "'Jost', sans-serif", color: "rgba(255,255,255,0.35)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 2 }}>{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35, duration: 0.7 }}
            className="flex flex-wrap items-center gap-4 mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(201,168,76,0.35)" }}
              whileTap={{ scale: 0.97 }}
              style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase" }}
              className="flex items-center gap-3 px-9 py-4 rounded-full text-[#060f09] font-medium bg-[#c9a84c] hover:bg-[#dbb95c] transition-colors duration-300"
            >
              Shop Collection
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{ fontFamily: "'Jost', sans-serif", fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase" }}
              className="flex items-center gap-3 px-9 py-4 rounded-full text-white/80 border border-white/20 hover:border-white/50 hover:text-white transition-all duration-300 backdrop-blur-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
              View Lookbook
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ── FLOATING BADGE ── */}
        <FloatingBadge delay={1.6} />

        {/* ── IMAGE PANEL (right side, desktop) ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ x: springX, y: springY }}
          className="absolute right-0 top-0 bottom-0 w-[40%] hidden lg:block pointer-events-none z-10"
        >
          {/* Vertical text label */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="absolute top-1/2 -translate-y-1/2 -left-8 z-20 flex items-center gap-2"
          >
            <div style={{ writingMode: "vertical-rl", fontFamily: "'Jost', sans-serif", fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)" }}>
              Featured Look
            </div>
          </motion.div>

          {/* Gold accent border */}
          <div className="absolute left-0 top-[15%] bottom-[15%] w-px bg-gradient-to-b from-transparent via-[#c9a84c]/30 to-transparent" />
        </motion.div>

        {/* ── BOTTOM BAR ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-8 md:px-20 py-5 border-t border-white/5"
        >
          {/* Scroll indicator */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex flex-col items-center"
            >
              <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
                <div className="w-1 h-1.5 rounded-full bg-white/60" />
              </div>
            </motion.div>
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Scroll
            </span>
          </div>

          {/* Social links */}
          <div className="hidden md:flex items-center gap-6">
            {["Instagram", "Pinterest", "TikTok"].map((s) => (
              <a
                key={s}
                href="#"
                style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}
                className="hover:text-[#c9a84c] transition-colors duration-300"
              >
                {s}
              </a>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-500"
                style={{
                  width: i === 0 ? 20 : 6,
                  height: 6,
                  background: i === 0 ? "#c9a84c" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ── AMBIENT GLOW ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 2 }}
          className="absolute bottom-0 left-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 100%, rgba(11,86,54,0.25) 0%, transparent 70%)" }}
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 2 }}
          className="absolute top-0 right-0 w-[400px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(201,168,76,0.08) 0%, transparent 70%)" }}
        />

      </section>
    </>
  );
}