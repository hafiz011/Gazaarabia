"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  ShoppingBag,
  Tag,
  Palette,
  ClipboardList,
  Truck,
  Droplets,
  Ruler,
  Grid,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin") router.replace(ROUTES.HOME);
  }, [status, session, router]);

  //  Counts (Mock Data — Replace with API calls)
  const [counts, setCounts] = useState({
    blogs: 45,
    blogCategories: 8,
    brands: 12,
    categoryList: 20,
    color: 15,
    colorsList: 10,
    deliveryOptions: 5,
    materialCares: 6,
    products: 120,
    sizeAdd: 4,
    sizes: 7,
    subcategories: 18,
  });

  // 🧭 Sections Config
  const sections = [
    { key: "blogCategories", label: "Blog Categories", icon: <Layers size={28} />, path: "/admin/blog-categories" },
    { key: "blogs", label: "Blogs", icon: <FileText size={28} />, path: "/admin/blogs" },
    { key: "brands", label: "Brands", icon: <Tag size={28} />, path: "/admin/brands" },
    { key: "sizes", label: "Sizes", icon: <Ruler size={28} />, path: "/admin/sizes" },
    { key: "colorsList", label: "Colors", icon: <Palette size={28} />, path: "/admin/colors-list" },
    { key: "categoryList", label: "Categories", icon: <ClipboardList size={28} />, path: "/admin/category-list" },
    { key: "subcategories", label: "Subcategories", icon: <Grid size={28} />, path: "/admin/subcategories" },
    { key: "deliveryOptions", label: "Delivery Options", icon: <Truck size={28} />, path: "/admin/delivery-options" },
    { key: "materialCares", label: "Material Cares", icon: <Droplets size={28} />, path: "/admin/material-cares" },
    { key: "products", label: "Products", icon: <ShoppingBag size={28} />, path: "/admin/products" },
  ];

  //  You can fetch real counts here
  useEffect(() => {
    // Example:
    // const res = await fetch("/api/dashboard/counts")
    // setCounts(await res.json())
  }, []);

  return (
    <div className="space-y-10">

      {/* Quick Access Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {sections.map((item, idx) => (
          <button
            key={idx}
            onClick={() => router.push(item.path)}
            className="group bg-white rounded-xl border border-[var(--soft-gray)] p-5 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow-md transition cursor-pointer hover:border-[var(--brand-primary)]"
          >
            <div className="text-[var(--brand-primary)] group-hover:scale-110 transition">
              {item.icon}
            </div>
            <p className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
              {item.label}
            </p>
            <p className="text-sm text-[var(--text-muted)] font-semibold">
              {counts[item.key as keyof typeof counts]} total
            </p>
          </button>
        ))}
      </div>

      {/* 📝 Recent Activities */}
      <div className="bg-white rounded-xl shadow p-6 border border-[var(--soft-gray)] mt-8">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
          Recent Blogs
        </h3>
        <div className="divide-y divide-[var(--soft-gray)]">
          {[1, 2, 3].map((item) => (
            <div key={item} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-[var(--text-primary)]">
                  Blog Title {item}
                </p>
                <p className="text-[var(--text-muted)] text-sm">Published 2 days ago</p>
              </div>
              <button className="px-3 py-1 text-sm rounded-md border border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition">
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
