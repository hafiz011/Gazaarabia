"use client";

import { useParams } from "next/navigation";
import { FaCalendarAlt, FaUserAlt, FaTag } from "react-icons/fa";

export default function BlogDetailPage() {
    const { slug } = useParams();

    // 📝 Mock data — replace with real API or CMS data later
    const blogs = [
        {
            slug: "top-fashion-trends-2025",
            title: "Top Fashion Trends of 2025",
            author: "Sarah Khan",
            date: "Oct 15, 2025",
            category: "Fashion",
            image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
            content: `
        Fashion in 2025 is all about self-expression, sustainability, and creativity. 
        From eco-friendly fabrics to bold color blocking, the trends this year are 
        vibrant, inclusive, and future-forward.

        Sustainability is no longer just a buzzword—it's the foundation of modern fashion. 
        Brands are embracing recycled materials, ethical production, and timeless designs 
        to reduce waste and make style more meaningful.

        Another big trend is the rise of tech-integrated clothing. Smart fabrics, 
        temperature control, and even built-in wearables are redefining what it means to dress with purpose.

        Whether you're a minimalist or a maximalist, 2025 offers something for everyone.
      `,
        },
        {
            slug: "timeless-beauty-rituals",
            title: "Timeless Beauty Rituals",
            author: "Ayesha Noor",
            date: "Oct 10, 2025",
            category: "Beauty",
            image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200",
            content: `
        Beauty isn't about trends; it's about timeless rituals that enhance your natural glow.
        From natural skincare remedies to holistic wellness, beauty is evolving in a way that celebrates individuality.
      `,
        },
    ];

    const blog = blogs.find((b) => b.slug === slug);

    if (!blog) {
        return (
            <div className="w-full min-h-[50vh] flex items-center justify-center text-xl font-semibold text-[var(--text-muted)]">
                Blog not found 😕
            </div>
        );
    }

    return (
        <div className="w-full text-[var(--text-primary)]">
            {/* 🪄 Hero Section */}
            <section className="relative h-[400px] flex items-center justify-center text-center overflow-hidden">
                <img
                    src={blog.image}
                    alt={blog.title}
                    className="absolute inset-0 w-full h-full object-cover brightness-75"
                />
                <div className="absolute inset-0 bg-black/30"></div>

                <div className="relative z-10 max-w-3xl mx-auto px-6 text-white">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                        {blog.title}
                    </h1>
                    <div className="flex justify-center gap-5 text-sm text-white/90">
                        <span className="flex items-center gap-2">
                            <FaCalendarAlt size={14} /> {blog.date}
                        </span>
                        <span className="flex items-center gap-2">
                            <FaUserAlt size={14} /> {blog.author}
                        </span>
                        <span className="flex items-center gap-2">
                            <FaTag size={14} /> {blog.category}
                        </span>
                    </div>
                </div>
            </section>

            {/* 📝 Blog Content */}
            <section className="py-16 bg-[var(--soft-gray)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-4xl mx-auto px-6 relative z-10 bg-white rounded-2xl shadow-lg p-10 border border-[var(--mid-gray)]">
                    <div className="w-24 h-1 mx-auto mb-8 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    <div className="prose max-w-none text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                        {blog.content}
                    </div>
                </div>
            </section>

            {/* 📩 CTA Section */}
            <section className="py-16 bg-[var(--soft-gray)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent opacity-50"></div>
                <div className="relative z-10 max-w-xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-[var(--black)] mb-4">
                        Enjoyed this article?
                    </h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-6 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>
                    <p className="text-[var(--text-secondary)] mb-8">
                        Subscribe to our newsletter and never miss the latest trends, tips, and insights.
                    </p>
                    <a
                        href="/contact"
                        className="group relative inline-flex items-center justify-center overflow-hidden px-8 py-3 font-semibold text-white rounded-lg shadow-md bg-[var(--brand-primary)] hover:scale-[1.03] transition-all duration-500"
                    >
                        <span className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative z-10">Subscribe Now</span>
                    </a>
                </div>
            </section>
        </div>
    );
}
