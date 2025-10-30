"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaCalendarAlt, FaUserAlt, FaTag } from "react-icons/fa";
import { blogsService } from "@/lib/services/front-end/blogsService";
import moment from "moment";

interface Blog {
  id: number;
  title: string;
  slug: string;
  image: string;
  content: string;
  createdAt: string;
  category: { id: number; name: string };
}

export default function BlogDetailPage() {
  const { slug } = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("🪄 slug from URL:", slug);

    if (!slug) return;

    const fetchBlog = async () => {
      try {
        const data :any = await blogsService.getBlogBySlug(slug as string);
        console.log(" Blog fetched:", data);
        setBlog(data?.data ?? null);
      } catch (err) {
        console.error(" Error fetching blog:", err);
        setError("Blog not found");
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center text-lg text-[var(--text-muted)]">
        Loading blog...
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center text-xl font-semibold text-[var(--text-muted)]">
        {error || "Blog not found 😕"}
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
          <div className="flex justify-center gap-5 text-sm text-white/90 flex-wrap">
            <span className="flex items-center gap-2">
              <FaCalendarAlt size={14} />{" "}
              {moment.utc(blog.createdAt).format("DD/MM/YYYY")}
              {/* {new Date(blog.createdAt).toLocaleDateString()} */}
            </span>
            <span className="flex items-center gap-2">
              <FaUserAlt size={14} /> Admin
            </span>
            <span className="flex items-center gap-2">
              <FaTag size={14} /> {blog.category?.name}
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
      {/* <section className="py-16 bg-[var(--soft-gray)] text-center relative overflow-hidden"> */}
      <section className="pt-6 pb-16 bg-[var(--soft-gray)] text-center relative overflow-hidden">

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
