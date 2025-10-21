"use client";

import { Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useModalStore } from "@/lib/stores/modalStore";
import Link from "next/link";

export default function AdminHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const openModal = useModalStore((state) => state.openModal);

  const titles: Record<
    string,
    { title: string; subtitle?: string; action?: { label: string; href?: string; modalKey?: string } }
  > = {
    "/admin/category-list": {
      title: "Categories",
      subtitle: "Manage the available categories for your product catalog.",
      action: { label: "Add Category", modalKey: "category" }, 
    },
    "/admin/subcategories": {
      title: "Subcategories",
      subtitle: "Manage the available subcategories for your product catalog.",
      action: { label: "Add Subcategory", modalKey: "subcategory" }, 
    },
    "/admin/colors-list": {
      title: "Colors",
      subtitle: "Manage available colors.",
      action: { label: "Add Color", href: "/admin/color" },
    },
    "/admin/sizes": {
      title: "Sizes",
      subtitle: "Manage available sizes.",
      action: { label: "Add Size", href: "/admin/size-add" },
    },
   "/admin/material-cares": {
      title: "Material Cares Advice",
      subtitle: "Manage material cares advice.",
      action: { label: "Add Material Care", href: "/admin/material-cares/form" },
    },
   "/admin/brands": {
      title: "Brands",
      subtitle: "Manage the available brands for your product catalog.",
      action: { label: "Add Brand", href: "/admin/brands/form" },
    },
   "/admin/products": {
      title: "Products",
      subtitle: "Manage the available products.",
      action: { label: "Add Product", href: "/admin/products/form" },
    },
   "/admin/delivery-options": {
      title: "Delivery Options",
      subtitle: "Manage the delivery options.",
      action: { label: "Add Delivery Option", href: "/admin/delivery-options/form" },
    },
   "/admin/blog-categories": {
      title: "Blog Categories",
      subtitle: "Manage the blog categories.",
      action: { label: "Add Category", modalKey: "blog-category" },
    },
   "/admin/blogs": {
      title: "Blogs",
      subtitle: "Manage the blogs.",
      action: { label: "Add Blog",href: "/admin/blogs/form" },
    },
  };

  const current = titles[pathname] || {
    title: "Admin Panel",
    subtitle: "Manage your dashboard",
  };

  const handleActionClick = () => {
    if (current.action?.modalKey) {
      openModal(current.action.modalKey);  // ✅ fire global modal trigger
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-6 py-4 sticky top-0 z-50 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderBottom: "1px solid var(--soft-gray)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div className="flex items-start sm:items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--soft-gray)] transition"
          aria-label="Toggle Sidebar"
        >
          <Menu size={22} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            {current.title}
          </h1>
          {current.subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-tight">
              {current.subtitle}
            </p>
          )}
        </div>
      </div>

      {current.action && (
        current.action.href ? (
          <Link
            href={current.action.href}
            className="flex items-center gap-2 bg-[var(--brand-primary)] text-white text-sm font-medium px-4 py-2 rounded-md shadow-md hover:bg-[var(--brand-secondary)] transition"
          >
            <Plus size={18} />
            {current.action.label}
          </Link>
        ) : (
          <button
            onClick={handleActionClick}
            className="flex items-center gap-2 bg-[var(--brand-primary)] text-white text-sm font-medium px-4 py-2 rounded-md shadow-md hover:bg-[var(--brand-secondary)] transition"
          >
            <Plus size={18} />
            {current.action.label}
          </button>
        )
      )}
    </header>
  );
}
