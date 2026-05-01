"use client";

import { Download, Menu, Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useModalStore } from "@/lib/stores/modalStore";
import Link from "next/link";

export default function SellerHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname();
  const openModal = useModalStore((state) => state.openModal);

  const titles: Record<
    string,
    { title: string; subtitle?: string; action?: { label: string; href?: string; modalKey?: string, type?: string } }
  > = {
    "/seller": {
      title: "Dashboard",
      subtitle: "Overview of your store content and modules.",
    },
    "/seller/products": {
      title: "Products",
      subtitle: "Manage the available products.",
      action: { label: "Add Product", href: "/seller/products/form" },
    },

    "/seller/delivery-options": {
      title: "Delivery Options",
      subtitle: "Manage the delivery options.",
      action: { label: "Add Delivery Option", href: "/seller/delivery-options/form" },
    },
    "/seller/return-reasons": {
      title: "Return Reasons",
      subtitle: "Manage the return reasons for your product catalog.",
      action: { label: "Add Reason", modalKey: "returnReason" },
    },

  };

  const current = titles[pathname] || {
    title: "Seller Panel",
    subtitle: "Manage your dashboard",
  };

  const handleActionClick = () => {
    if (current.action?.modalKey) {
      openModal(current.action.modalKey);  // fire global modal trigger
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

      {/* {current.action && (
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
      )} */}

      {current.action && (
        current.action.href ? (
          /* Standard Link Button */
          <Link
            href={current.action.href}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md shadow-md transition
        ${current.action.type === "download"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)]"
              }`}
          >
            {current.action.type === "download" ? (
              <Download size={18} />
            ) : (
              <Plus size={18} />
            )}
            {current.action.label}
          </Link>
        ) : (
          /* Modal-triggering Button */
          <button
            onClick={handleActionClick}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md shadow-md transition
        ${current.action.type === "download"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)]"
              }`}
          >
            {current.action.type === "download" ? (
              <Download size={18} />
            ) : (
              <Plus size={18} />
            )}
            {current.action.label}
          </button>
        )
      )}


    </header>
  );
}
