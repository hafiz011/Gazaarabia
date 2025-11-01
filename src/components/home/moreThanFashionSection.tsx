"use client";

import Image from "next/image";
import { Heart, Globe2, Users } from "lucide-react";

export default function MoreThanFashionSection() {
  return (
    <section className="relative bg-[#FCFBEF] py-16 md:py-20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 lg:px-20 grid md:grid-cols-2 gap-8 items-center">
        {/* LEFT CONTENT */}
        <div className="md:pr-10">
          {/* Gradient Heading */}
          <h2 className="text-3xl md:text-4xl font-bold leading-snug mb-4">
            <span className="bg-gradient-to-r from-[#5A3921] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              More Than Fashion,
            </span>{" "}
            <span className="text-[var(--brand-secondary)]">A Movement</span>
          </h2>

          <p className="text-[var(--text-secondary)] text-base md:text-[1.05rem] leading-relaxed mb-4 max-w-lg">
            GAZAARABIA combines timeless modest fashion with a mission to support
            the people of Gaza and communities facing similar challenges worldwide.
            Every purchase you make directly contributes to humanitarian aid and support.
          </p>

          <p className="text-[var(--text-secondary)] text-base md:text-[1.05rem] leading-relaxed mb-8 max-w-lg">
            We believe fashion should be a force for good, creating beautiful clothing
            while making a meaningful difference in the lives of those who need it most.
          </p>

          {/* ICON CARDS */}
          <div className="flex flex-wrap gap-5">
            <div className="flex-1 min-w-[150px] bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] transition-all duration-300 p-5 flex flex-col items-center text-center">
              <Heart size={24} className="text-[var(--brand-primary)] mb-2" strokeWidth={1.8} />
              <p className="font-medium text-[var(--text-primary)] text-sm md:text-base">
                Ethical Fashion
              </p>
            </div>

            <div className="flex-1 min-w-[150px] bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] transition-all duration-300 p-5 flex flex-col items-center text-center">
              <Globe2 size={24} className="text-[var(--brand-secondary)] mb-2" strokeWidth={1.8} />
              <p className="font-medium text-[var(--text-primary)] text-sm md:text-base">
                Global Impact
              </p>
            </div>

            <div className="flex-1 min-w-[150px] bg-white rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_15px_rgba(0,0,0,0.1)] transition-all duration-300 p-5 flex flex-col items-center text-center">
              <Users size={24} className="text-[#d1a900] mb-2" strokeWidth={1.8} />
              <p className="font-medium text-[var(--text-primary)] text-sm md:text-base">
                Community Support
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center md:justify-end">
          {/* Full-width image (no white background, no stretch) */}
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden">
            <div className="relative w-full h-[480px] md:h-[520px]">
              <Image
                src="/images/home/more-than-fashion.jpg"
                alt="More Than Fashion"
                fill
                className="object-cover object-center rounded-2xl"
                priority
              />
            </div>
          </div>

          {/* Floating badge outside image */}
          <div className="absolute bottom-[-20px] right-[-20px] bg-[#F4C430] text-[#3A2A00] font-semibold text-xs md:text-sm py-2 px-4 rounded-lg shadow-md">
            100+ <span className="font-normal">Families Supported</span>
          </div>
        </div>
      </div>
    </section>
  );
}
