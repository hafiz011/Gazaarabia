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
  Home,
  HelpingHand,
  HeartHandshake,
  UserPlus,
  Package,
  Plus,
} from "lucide-react";
import PopupAlert from "../PopupAlert";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";



const links = [
  // {
  //   label: "Dashboard",
  //   icon: LayoutDashboard,
  //   children: [
  //     { href: "/seller", label: "Overview", icon: LayoutDashboard },
  //     { href: "/seller/analytics", label: "Analytics", icon: Star },
  //   ],
  // },
  { href: "/seller", label: "Overview", icon: LayoutDashboard },
  {
    label: "Orders",
    icon: ShoppingCart,
    children: [
      { href: "/seller/orders", label: "Manage Orders", icon: ShoppingCart },
      { href: "/seller/returns", label: "Manage Returns", icon: ClipboardList },
    ],
  },

  {
    label: "Products",
    icon: Boxes,
    children: [
      { href: "/seller/products/form", label: "Add Product", icon: Plus },
      { href: "/seller/products", label: "Manage Products", icon: Boxes },
    ],
  },


  {
    label: "Logistics",
    icon: Truck,
    children: [
      { href: "/seller/delivery-options", label: "Delivery Options", icon: Truck },
      { href: "/seller/delivery-settings", label: "Delivery Settings", icon: Package },
    ],
  },

  {
    label: "Finance",
    icon: BadgeDollarSign,
    children: [
      // { href: "/seller/payouts", label: "My Payouts", icon: BadgeDollarSign },
      { href: "/seller/earnings", label: "Earnings History", icon: BadgeDollarSign },
    ],
  },

  // { href: "/seller/customers", label: "Customers", icon: Users },
  { href: "/seller/reviews", label: "Customer Reviews", icon: Star },

  // {
  //   label: "Settings",
  //   icon: Settings,
  //   children: [
  //     { href: "/seller/profile", label: "Store Profile", icon: Settings },
  //     { href: "/seller/settings", label: "Store Settings", icon: Settings },
  //   ],
  // },

  { href: "/seller/profile", label: "Store Profile", icon: Settings },

  {
    href: "/seller/support",
    label: "Support",
    icon: HelpCircle,
  },
];


export default function SellerSidebar({
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

  const alowedRoles = ["seller"];

  const userRole = session?.user?.role?.toLowerCase();

  // const allowedForContentManager = [
  //   "/admin/blog-categories",
  //   "/admin/blogs"
  // ];

  const [confirmLogout, setConfirmLogout] = useState(false);

  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };


  // Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.SELLER.LOGIN);
    else if (status === "authenticated" && !alowedRoles.includes(session?.user?.role))
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: ROUTES.SELLER.LOGIN });
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
          {/* {!collapsed && (
            <h2 className="text-lg font-semibold tracking-wide text-white">
              Gazaarabia{" "}
              <span className="text-[var(--brand-primary)]">Admin</span>
            </h2>
          )} */}

          {!collapsed && (
            <h2 className="text-lg font-semibold tracking-wide text-white">
              Gazaarabia{" "}
              <span className="text-[var(--brand-primary)]">
                {session?.user?.role === "seller" ? "Seller" : ""
                  // ? "Admin"
                  // : session?.user?.role === "content_manager"
                  //   ? "Content Manager"
                  //   : ""
                }
              </span>
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



            {links
              .filter((item) => {

                // seller sees everything
                if (userRole === "seller") return true;

                // Others see nothing
                return false;
              }).map((item) => {
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
                            {item.children
                              .filter((child) => {
                                if (userRole === "seller") return true;
                              })
                              .map((child) => {
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
                  <span> &copy; {new Date().getFullYear()} Gazaarabia</span>
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
