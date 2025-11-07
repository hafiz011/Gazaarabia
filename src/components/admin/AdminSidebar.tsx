"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Truck,
  FileText,
  BookOpen,
  LogOut,
  ListTree,
  PanelsTopLeft,
  Star,
  Settings,
  ClipboardList,
  MessageSquare,
  Boxes,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MessageCircle,
  BadgeDollarSign,
  TicketPercent,
} from "lucide-react";
import PopupAlert from "../PopupAlert";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/menus", label: "Menus", icon: PanelsTopLeft },
  { href: "/admin/submenus", label: "Sub Menus", icon: ListTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },

  {
    label: "Affiliates",
    icon: Star,
    children: [
      { href: "/admin/affiliates", label: "List Affiliates", icon: Users },
      { href: "/admin/affiliates/payouts", label: "Payouts", icon: BadgeDollarSign },
      // { href: "/admin/affiliates/payouts-history", label: "Payout History", icon: BadgeDollarSign },
      // { href: "/admin/affiliates/settings", label: "Commission Settings", icon: Settings },
    ],
  },

    { href: "/admin/coupons", label: "coupons", icon: TicketPercent },

  { href: "/admin/sizes", label: "Sizes", icon: Ruler },
  { href: "/admin/colors-list", label: "Colors", icon: Palette },
  { href: "/admin/category-list", label: "Categories", icon: Layers },
  { href: "/admin/subcategories", label: "Subcategories", icon: Grid },
  { href: "/admin/material-cares", label: "Material Cares", icon: Droplets },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/delivery-options", label: "Delivery Options", icon: Truck },
  { href: "/admin/blog-categories", label: "Blog Categories", icon: ClipboardList },
  { href: "/admin/blogs", label: "Blogs", icon: BookOpen },
  { href: "/admin/faq-categories", label: "Faq Categories", icon: Settings },
  { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { href: "/admin/contact-us", label: "Contact Us", icon: MessageCircle },
];

export default function AdminSidebar({
  isOpen,
  collapsed,
  setCollapsed,
}: {
  isOpen: boolean;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };


  // 🔒 Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: ROUTES.ADMIN.LOGIN });
  };

  return (
    <>
      <aside
        className={`fixed z-[9999] top-0 left-0 h-screen transform transition-all duration-300 ease-in-out flex flex-col
        ${collapsed ? "w-[80px]" : "w-64"} 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
        style={{
          background:
            "linear-gradient(180deg, rgba(30,42,74,0.95) 0%, rgba(30,42,74,0.88) 100%)",
          backdropFilter: "blur(10px)",
          overflowY: "auto",
          overflowX: "hidden",
          pointerEvents: "auto",
        }}
      >
        {/* Logo Section */}
        <div
          className={`p-6 border-b border-[var(--dark-gray)] flex items-center ${collapsed ? "justify-center" : "justify-between"
            } gap-2`}
        >
          {!collapsed && (
            <h2 className="text-lg font-semibold tracking-wide text-white">
              Gaza Arabia{" "}
              <span className="text-[var(--brand-primary)]">Admin</span>
            </h2>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-300 hover:text-white transition"
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <nav className="flex-1 overflow-y-auto px-3 mt-5 pb-10 relative z-30">

            {links.map((item) => {
              const isGroup = !!item.children;

              //  GROUP MENU
              if (isGroup) {
                const Icon = item.icon;
                const isOpen = openGroups.includes(item.label);
                const isActiveGroup = item.children.some((child) => pathname.startsWith(child.href));

                return (
                  <div key={item.label} className="mb-1">
                    <button
                      onClick={() => toggleGroup(item.label)}
                      className={`flex items-center gap-3 w-full px-4 py-[12px] rounded-xl cursor-pointer transition
            ${isActiveGroup ? "bg-[var(--brand-primary)] text-white mt-2" : "text-[var(--soft-gray)] hover:bg-[var(--brand-secondary)] hover:text-white mt-2"}          `}
                      style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                    >
                      <Icon size={20} />
                      {!collapsed && (
                        <>
                          <span>{item.label}</span>
                          <ChevronRight
                            size={18}
                            className={`ml-auto transition-transform ${isOpen ? "rotate-90" : ""}`}
                          />
                        </>
                      )}
                    </button>

                    {/* Submenu */}
                    {!collapsed && (
                      <div
                        className="overflow-hidden transition-all"
                        style={{ maxHeight: isOpen ? `${item.children.length * 40}px` : "0px" }}
                      >
                        <div className="ml-10 mt-1 flex flex-col gap-1">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isActive = pathname === child.href;

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded-md transition
                      ${isActive ? "text-white font-medium" : "text-gray-400 hover:text-white"}
                    `}
                              >
                                <ChildIcon size={16} />
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              //  NORMAL LINKS
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-[12px] rounded-xl text-sm transition
        ${isActive ? "bg-[var(--brand-primary)] text-white mt-2" : "text-[var(--soft-gray)] hover:bg-[var(--brand-secondary)] hover:text-white mt-2"}      `}
                  style={{ justifyContent: collapsed ? "center" : "flex-start" }}
                >
                  <Icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}




            {/* {links.map(({ href, label, icon: Icon }, index) => {
              const isActive = pathname === href;
              const isLast = index === links.length - 1;

              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 px-4 py-[12px] rounded-xl text-sm font-medium transition-all duration-200 relative
                    ${
                      isActive
                        ? "bg-[var(--brand-primary)] text-white shadow-[0_4px_12px_rgba(232,44,63,0.4)] scale-[1.02]"
                        : "text-[var(--soft-gray)] hover:bg-[var(--brand-secondary)] hover:text-white hover:scale-[1.02]"
                    }`}
                  style={{
                    marginTop: "8px",
                    marginBottom: isLast ? "20px" : "8px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    transition: "all 0.25s ease",
                  }}
                >
                  <Icon size={20} className="shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </Link>
              );
            })} */}
          </nav>

          {/* Footer */}
          <div className="border-t border-[var(--dark-gray)] bg-[rgba(30,42,74,0.98)] relative z-10">
            <button
              onClick={() => setConfirmLogout(true)}
              className={`w-full flex items-center justify-between px-4 py-3 
                 text-white text-sm 
                 hover:bg-[var(--brand-primary)] 
                 transition-colors
                 ${collapsed ? "justify-center" : ""}`}
            >
              {collapsed ? (
                <LogOut size={18} />
              ) : (
                <>
                  <span>© {new Date().getFullYear()} Gaza Arabia</span>
                  <div className="flex items-center gap-2">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </div>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

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
