"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isLive: boolean;
}

const LaunchAnnouncementBanner = () => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const launchDate = new Date("2026-05-10T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isLive: true,
        });
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((distance / 1000 / 60) % 60),
        seconds: Math.floor((distance / 1000) % 60),
        isLive: false,
      });
    };

    // Update immediately
    updateCountdown();

    // Then update every second
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const bannerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const counterVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delay: 0.3, duration: 0.5 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={bannerVariants}
      className="relative overflow-hidden w-full bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/18 backdrop-blur-sm" />

      {/* Decorative background elements */}
      <div className="absolute -left-40 -top-20 w-[36rem] h-[36rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl"></div>
      <div className="absolute -right-40 -bottom-20 w-[36rem] h-[36rem] bg-[var(--brand-primary)] opacity-10 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 md:gap-10 px-4 py-16 md:py-32 lg:py-40">
        {/* Top icon */}
        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.6 }}>
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-white" />
        </motion.div>

        {/* Main heading */}
        <div className="text-center space-y-4 md:space-y-6">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            GAZAARABIA
          </h1>
          <p className="text-lg md:text-2xl lg:text-3xl font-light tracking-widest text-white/90">
            LAUNCHING SOON
          </p>
        </div>

        {/* Countdown */}
        <motion.div variants={counterVariants} className="flex flex-col items-center gap-6">
          {!timeLeft.isLive ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 md:gap-4 lg:gap-6">
              {/* Days */}
              <div className="text-center">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tabular-nums">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm text-white/80 tracking-wide mt-1 md:mt-2">DAYS</div>
              </div>

              <div className="text-2xl md:text-4xl lg:text-5xl text-white/60">:</div>

              {/* Hours */}
              <div className="text-center">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tabular-nums">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm text-white/80 tracking-wide mt-1 md:mt-2">HOURS</div>
              </div>

              <div className="text-2xl md:text-4xl lg:text-5xl text-white/60">:</div>

              {/* Minutes */}
              <div className="text-center">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tabular-nums">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm text-white/80 tracking-wide mt-1 md:mt-2">MINUTES</div>
              </div>

              <div className="text-2xl md:text-4xl lg:text-5xl text-white/60">:</div>

              {/* Seconds */}
              <div className="text-center">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tabular-nums">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="text-xs md:text-sm text-white/80 tracking-wide mt-1 md:mt-2">SECONDS</div>
              </div>
            </div>
          ) : (
            <motion.div variants={counterVariants} className="text-center">
              <div className="text-5xl md:text-7xl font-bold text-white mb-4">
                We are Live
              </div>
              <p className="text-xl md:text-2xl text-white/90">Explore our collection now</p>
            </motion.div>
          )}
        </motion.div>

        {/* Date */}
        <div className="text-center pt-4 md:pt-8">
          <p className="text-sm md:text-lg font-light tracking-widest text-white/80">
            10 MAY 2026
          </p>
        </div>

        {/* Bottom decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex gap-2 pt-6 md:pt-10"
        >
          <Star className="w-6 h-6 md:w-8 md:h-8 text-white/70" />
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-white/70" />
          <Star className="w-6 h-6 md:w-8 md:h-8 text-white/70" />
        </motion.div>
      </div>

      {/* Bottom border */}
      <div className="relative z-10 h-px bg-gradient-to-r from-[var(--brand-secondary)] via-white/30 to-[var(--brand-primary)]" />
    </motion.div>
  );
};

export default LaunchAnnouncementBanner;
