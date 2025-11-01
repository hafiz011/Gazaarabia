"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function InfoGridSection() {
  const cards = [
    {
      src: "/images/home/final1.jpg",
      title: "View Lookbook",
      desc: "Discover how effortless modest fashion can be — browse for timeless styling inspirations.",
    },
    {
      src: "/images/home/final2.jpg",
      title: "About Us",
      desc: "Modesty at the core of every design — blending tradition with modern elegance.",
    },
    {
      src: "/images/home/final3.jpg",
      title: "Introducing Bakhoor",
      desc: "A sensory journey that elevates your space and spirit through delicate aroma.",
    },
    {
      src: "/images/home/final4.jpg",
      title: "Journal",
      desc: "Explore our Journal for styling tips, fashion inspiration, and behind-the-scenes stories.",
    },
  ];

  return (
    <section className="bg-[#ffffff] pt-6 pb-16 md:pt-8 md:pb-20">
      <div className="max-w-[1500px] mx-auto px-4 md:px-10 text-center">
        {/* Heading */}
        <div className="mb-10">
          <h2 className="text-[1.9rem] md:text-[2.3rem] font-semibold tracking-tight text-[var(--text-primary)] leading-tight">
            <span className="bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent">
              Explore More
            </span>
          </h2>
          <div className="w-20 h-[3px] bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] mx-auto mt-2 mb-4 rounded-full"></div>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            Step deeper into our world of modest luxury — from editorial lookbooks to journals and aromas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {cards.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="group cursor-pointer flex flex-col items-center text-center"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden rounded-2xl w-full h-[400px] md:h-[450px] bg-[#F9F9F9] shadow-sm">
                <Image
                  src={item.src}
                  alt={item.title}
                  width={600}
                  height={800}
                  className="w-full h-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
              </div>

              {/* Content */}
              <div className="mt-5 px-3 max-w-[90%] mx-auto">
                <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-secondary)] transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-[var(--text-muted)] leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
