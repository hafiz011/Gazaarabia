"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Ruler,
  Palette,
  Layers,
  Grid,
  Droplets,
  Tag,
  Package,
  Truck,
  FileText,
  BookOpen,
  LogOut
} from "lucide-react";
import PopupAlert from "../PopupAlert";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sizes", label: "Sizes", icon: Ruler },
  { href: "/admin/colors-list", label: "Colors", icon: Palette },
  { href: "/admin/category-list", label: "Categories", icon: Layers },
  { href: "/admin/subcategories", label: "Subcategories", icon: Grid },
  { href: "/admin/material-cares", label: "Material Cares", icon: Droplets },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/delivery-options", label: "Delivery Options", icon: Truck },
  { href: "/admin/blog-categories", label: "Blog Categories", icon: BookOpen },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
];

export default function AdminSidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: session, status } = useSession();
  const [confirmLogout, setConfirmLogout] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin") router.replace(ROUTES.HOME);
  }, [status, session, router]);

  const handleLogout = async () => {
    // Add your actual logout logic here (e.g. signOut())
    console.log("User logged out");
    // setConfirmLogout(false);
    await signOut({ callbackUrl: ROUTES.ADMIN.LOGIN });
  };

  return (
    <>
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full w-64 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}
        style={{
          background:
            "linear-gradient(180deg, rgba(30,42,74,0.95) 0%, rgba(30,42,74,0.88) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-[var(--dark-gray)] flex items-center gap-2">
          <h2 className="text-lg font-semibold tracking-wide text-white">
            Gaza Arabia <span className="text-[var(--brand-primary)]">Admin</span>
          </h2>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 flex flex-col gap-1 px-3">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                ${isActive
                    ? "bg-[var(--brand-primary)] text-white shadow-[0_4px_12px_rgba(232,44,63,0.4)] scale-[1.02]"
                    : "text-[var(--soft-gray)] hover:bg-[var(--brand-secondary)] hover:text-white hover:scale-[1.02]"
                  }`}
              >
                <Icon size={20} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>


        {/* Footer Logout Section */}
        <div className="border-t border-[var(--dark-gray)] bg-[rgba(30,42,74,0.95)]">
          <button
            // onClick={handleLogout}
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center justify-between px-4 py-3 
               text-white text-sm 
               bg-[rgba(30,42,74,0.95)] 
               hover:bg-[var(--brand-primary)] 
               transition-colors"
          >
            <span>© {new Date().getFullYear()} Gaza Arabia</span>
            <div className="flex items-center gap-2">
              <LogOut size={16} />
              <span>Logout</span>
            </div>
          </button>
        </div>


      </aside>

      {/* 🚪 Logout confirmation */}
      {confirmLogout && (
        <PopupAlert
          type="warning"
          message="Are you sure you want to sign out?"
          confirmText="Yes, Sign Out"
          cancelText="Cancel"
          onConfirm={handleLogout}
          onCancel={() => setConfirmLogout(false)}
          show={confirmLogout}
        />
      )}

    </>
  );
}
