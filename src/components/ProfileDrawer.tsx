"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  X,
  LogOut,
  ChevronRight,
  User,
  Heart,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isOpen, onClose }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const [drawerWidth, setDrawerWidth] = useState("360px");

  // ✅ Responsive width control
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 480) {
        setDrawerWidth("80%"); // narrower on mobile
      } else {
        setDrawerWidth("360px"); // fixed width on desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: ROUTES.USER.LOGIN });
  };

  const menuItems = [
    { label: "My Orders", href: "/orders", icon: <ShoppingBag size={18} /> },
    { label: "My Details", href: "/account/details", icon: <User size={18} /> },
    {
      label: "Loyalty Dashboard",
      href: "/account/loyalty",
      icon: <Settings size={18} />,
    },
    { label: "My Wishlist (1)", href: "/wishlist", icon: <Heart size={18} /> },
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{ width: drawerWidth, maxWidth: "360px" }}
        className={`fixed top-0 right-0 h-full bg-[var(--background)] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--soft-gray)]">
          <h3 className="text-lg font-semibold tracking-wide uppercase text-[var(--text-primary)]">
            My Account
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[var(--soft-gray)] transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-6 py-6 justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="pb-5 border-b border-[var(--soft-gray)] min-h-[70px] flex flex-col justify-center">
              {status === "authenticated" ? (
                <>
                  <p className="text-[var(--text-primary)] font-medium text-[15px] leading-tight">
                    Hello,{" "}
                    <span className="font-semibold text-[var(--brand-primary)]">
                      {session?.user?.name || "Customer"}
                    </span>
                  </p>
                  <p className="text-[var(--text-muted)] text-sm mt-1">
                    You have{" "}
                    <span className="font-semibold text-[var(--brand-primary)]">
                      50 points
                    </span>{" "}
                    available today.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[var(--text-muted)] text-sm">
                    You are not logged in.
                  </p>
                  <p className="text-[var(--text-muted)] text-xs mt-1">
                    Sign in to access your orders, wishlist, and more.
                  </p>
                </>
              )}
            </div>

            {/* Menu Section */}
            {status === "authenticated" && (
              <div className="space-y-3">
                {menuItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between px-5 py-3 rounded-xl border border-[var(--soft-gray)] bg-white hover:shadow-md hover:border-[var(--brand-primary)] transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3 text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto border-t border-[var(--soft-gray)] bg-[var(--background)] px-5 py-6">
            {status === "authenticated" ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-[14px] font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] transition"
              >
                <LogOut size={18} />
                <span>Sign out</span>
              </button>
            ) : (
              <div className="w-full max-w-[280px] mx-auto flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={ROUTES.USER.LOGIN}
                    onClick={onClose}
                    className="w-full py-3 text-center rounded-full bg-[var(--brand-primary)] text-white font-medium hover:opacity-90 transition"
                  >
                    Login
                  </Link>
                  <Link
                    href={ROUTES.USER.REGISTER}
                    onClick={onClose}
                    className="w-full py-3 text-center rounded-full border border-[var(--brand-primary)] text-[var(--brand-primary)] font-medium hover:bg-[var(--brand-primary)] hover:text-white transition"
                  >
                    Sign Up
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
