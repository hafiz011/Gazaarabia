"use client";

import { useState } from "react";
import { FaCalendarAlt, FaUserAlt, FaChevronRight, FaRegFrown } from "react-icons/fa";
import Pagination from "@/components/Pagination";

export default function BlogsPage() {
    const categories = ["All", "Fashion", "Beauty", "Lifestyle", "Culture"];
    const [activeCategory, setActiveCategory] = useState("All");

    // 📝 Blog data
    const blogs = [
        {
            slug: "top-fashion-trends-2025",
            title: "Top Fashion Trends of 2025",
            author: "Sarah Khan",
            date: "Oct 15, 2025",
            image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
            excerpt: "Discover the hottest fashion trends of the year...",
            category: "Fashion",
        },
        {
            slug: "top-fashion-trends-2025",
            title: "Top Fashion Trends of 2025",
            author: "Sarah Khan",
            date: "Oct 15, 2025",
            image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
            excerpt: "Discover the hottest fashion trends of the year...",
            category: "Fashion",
        },
        {
            slug: "top-fashion-trends-2025",
            title: "Top Fashion Trends of 2025",
            author: "Sarah Khan",
            date: "Oct 15, 2025",
            image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
            excerpt: "Discover the hottest fashion trends of the year...",
            category: "Fashion",
        },
        {
            slug: "top-fashion-trends-2025",
            title: "Top Fashion Trends of 2025",
            author: "Sarah Khan",
            date: "Oct 15, 2025",
            image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200",
            excerpt: "Discover the hottest fashion trends of the year...",
            category: "Fashion",
        },
        {
            slug: "timeless-beauty-rituals",
            title: "Timeless Beauty Rituals",
            author: "Ayesha Noor",
            date: "Oct 10, 2025",
            image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200",
            excerpt: "Explore beauty rituals that have stood the test of time.",
            category: "Beauty",
        },
        {
            slug: "sustainable-style",
            title: "The Power of Sustainable Style",
            author: "Lina Omar",
            date: "Sep 15, 2025",
            image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1200",
            excerpt: "Why sustainable fashion matters now more than ever.",
            category: "Fashion",
        },
    ];

    // 🪄 Filter by category
    const filteredBlogs =
        activeCategory === "All"
            ? blogs
            : blogs.filter((blog) => blog.category === activeCategory);

    // 📍 Pagination logic
    const blogsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
    const startIndex = (currentPage - 1) * blogsPerPage;
    const endIndex = startIndex + blogsPerPage;
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

    return (
        <div className="w-full text-[var(--text-primary)]">
            {/* 🪄 Hero Section */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-24 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/25 backdrop-blur-sm"></div>
                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                        Our <span className="text-[var(--white)]">Blogs</span>
                    </h1>
                    <p className="text-lg text-white/90 max-w-xl mx-auto">
                        Insights, inspiration, and trends to keep you ahead in fashion, beauty, and lifestyle.
                    </p>
                </div>
            </section>

            {/* 🧭 Category Filter */}
            <div className="bg-white py-6 border-b border-[var(--mid-gray)] flex justify-center gap-3 flex-wrap">
                {categories.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setActiveCategory(cat);
                            setCurrentPage(1);
                        }}
                        className={`px-5 py-2 text-sm font-medium rounded-full border transition
              ${activeCategory === cat
                                ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                                : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 📰 Blog Grid */}
            <section className="py-20 bg-[var(--soft-gray)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">
                        Latest Blogs
                    </h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-12 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    {currentBlogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center text-[var(--text-muted)]">
                            <FaRegFrown size={48} className="mb-4 text-[var(--brand-secondary)]" />
                            <p className="text-lg font-medium">No blogs found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {currentBlogs.map((blog, i) => (
                                <div
                                    key={i}
                                    className="group relative bg-white rounded-2xl shadow-sm border border-[var(--mid-gray)] overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] opacity-0 group-hover:opacity-15 transition-opacity duration-500"></div>

                                    <div className="relative h-56 w-full overflow-hidden">
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>

                                    <div className="relative z-10 p-6 flex flex-col gap-3">
                                        <div className="flex items-center gap-4 text-[var(--text-muted)] text-xs">
                                            <span className="flex items-center gap-1">
                                                <FaCalendarAlt size={12} /> {blog.date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaUserAlt size={12} /> {blog.author}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors">
                                            {blog.title}
                                        </h3>
                                        <p className="text-[var(--text-secondary)] text-sm line-clamp-3">
                                            {blog.excerpt}
                                        </p>

                                        <a
                                            href={`/blogs/journal/${blog.slug}`}
                                            className="mt-2 inline-flex items-center gap-2 text-[var(--brand-secondary)] font-semibold hover:gap-3 transition-all"
                                        >
                                            Read More
                                            <FaChevronRight size={12} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 📍 Pagination Component */}
                    {totalPages > 1 && (
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
