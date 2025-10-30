"use client";

import { useEffect, useState } from "react";
import { FaCalendarAlt, FaUserAlt, FaChevronRight, FaRegFrown } from "react-icons/fa";
import Pagination from "@/components/Pagination";
// import { blogService } from "@/lib/services/blogService";
// import { blogCategoryService } from "@/lib/services/blogCategoryService";
import { blogsService } from "@/lib/services/front-end/blogsService";

interface Blog {
    id: number;
    title: string;
    slug: string;
    image: string;
    content: string;
    createdAt: string;
    category: { id: number; name: string };
}

interface BlogCategory {
    id: number;
    name: string;
}

type ActiveCategoryType = number | "All";

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [activeCategory, setActiveCategory] = useState<ActiveCategoryType | "All">("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const blogsPerPage = 6;

    // 🧭 Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const cats:any = await blogsService.getAllCategory();
                setCategories(cats?.data ?? []);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();
    }, []);

    // 🧭 Fetch blogs whenever category or search changes
    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const params: any = {};
                if (activeCategory !== "All") params.categoryId = activeCategory;
                if (searchTerm.trim()) params.search = searchTerm;
                const data: any = await blogsService.getAllBlogs(params);
                setBlogs(data?.data ?? []);
            } catch (err) {
                console.error("Failed to fetch blogs", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [activeCategory, searchTerm]);

    // 📍 Pagination logic
    const totalPages = Math.ceil(blogs.length / blogsPerPage);
    const startIndex = (currentPage - 1) * blogsPerPage;
    const currentBlogs = Array.isArray(blogs) ? blogs.slice(startIndex, startIndex + blogsPerPage) : [];

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
                <button
                    onClick={() => {
                        setActiveCategory("All");
                        setCurrentPage(1);
                    }}
                    className={`px-5 py-2 text-sm font-medium rounded-full border transition ${activeCategory === "All"
                        ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                        : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                        }`}
                >
                    All
                </button>
                {Array.isArray(categories) && categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                            setActiveCategory(cat.id);
                            setCurrentPage(1);
                        }}
                        className={`px-5 py-2 text-sm font-medium rounded-full border transition ${activeCategory === cat.id
                            ? "bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white border-transparent shadow-md"
                            : "border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-secondary)] hover:text-[var(--brand-secondary)]"
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* 📝 Search Box */}
            <div className="flex justify-center py-6 bg-[var(--soft-gray)]">
                <input
                    type="text"
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full max-w-md px-4 py-2 rounded-full border border-[var(--mid-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
                />
            </div>

            {/* 📰 Blog Grid */}
            {/* <section className="py-20 bg-[var(--soft-gray)] relative overflow-hidden"> */}
            {/* <section className="pt-10 pb-20 bg-[var(--soft-gray)] relative overflow-hidden"> */}
            <section className="pb-20 bg-[var(--soft-gray)] relative overflow-hidden">

                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <h2 className="text-3xl font-bold text-[var(--brand-primary)] text-center">
                        Latest Blogs
                    </h2>
                    <div className="w-24 h-1 mx-auto mt-3 mb-12 bg-gradient-to-r from-[var(--brand-secondary)] to-[var(--brand-primary)] rounded-full"></div>

                    {loading ? (
                        <div className="text-center py-16 text-[var(--text-muted)]">Loading blogs...</div>
                    ) : currentBlogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center pt-0 pb-16 text-center text-[var(--text-muted)]">
                            <FaRegFrown size={48} className="mb-4 text-[var(--brand-secondary)]" />
                            <p className="text-lg font-medium">No blogs found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {currentBlogs.map((blog) => (
                                <div
                                    key={blog.id}
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
                                                <FaCalendarAlt size={12} />
                                                {new Date(blog.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FaUserAlt size={12} /> Admin
                                            </span>
                                        </div>

                                        <h3
                                            className="text-lg font-semibold text-[var(--black)] group-hover:text-[var(--brand-primary)] transition-colors truncate"
                                        >
                                            {blog.title}
                                        </h3>

                                        <p className="text-[var(--text-secondary)] text-sm line-clamp-3">
                                            {blog.content}
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
