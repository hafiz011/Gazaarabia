"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User, Heart, ShoppingBag } from "lucide-react";
import ProfileDrawer from "@/components/ProfileDrawer";
import CartDrawer from "@/components/CartDrawer";
import { useRouter } from "next/navigation";

interface BannerItem {
  image: string;
  title: string;
  link: string;
}

interface DropdownMenu {
  left: string[];
  right: string[];
  banners: BannerItem[];
}

interface MenuItem {
  label: string;
  slug: string;
  dropdown?: DropdownMenu;
}

const DEFAULT_DROPDOWN: DropdownMenu = {
  left: [
    "All Collections",
    "Abayas",
    "Coats & Cover-ups",
    "Co-ords",
    "Athleisure",
    "Hoodies",
    "Loungewear",
    "Winter Scarves",
    "Back in Stock",
  ],
  right: [
    "New In Hijabs",
    "Essential Modal Hijabs",
    "Essential Jersey Hijabs",
    "Crepe Chiffon Hijabs",
    "Back to School Hijabs",
    "Tie Back Hijabs - New Colours",
  ],
  banners: [
    { image: "/images/header/arrivals.png", title: "New Arrivals", link: "/new-arrivals" },
    { image: "/images/header/coats-coverup.png", title: "Coats & Cover-ups", link: "/coats" },
  ],
};

const MENU_ITEMS: MenuItem[] = [
  { label: "NEW IN - AW25", slug: "new-in", dropdown: DEFAULT_DROPDOWN },
  { label: "HIJABS", slug: "hijabs", dropdown: DEFAULT_DROPDOWN },
  { label: "CLOTHING", slug: "clothing", dropdown: DEFAULT_DROPDOWN },
  { label: "MENS", slug: "mens", dropdown: DEFAULT_DROPDOWN },
  { label: "OUTLET", slug: "outlet", dropdown: DEFAULT_DROPDOWN },
  { label: "JOURNAL", slug: "blogs/journal", dropdown: DEFAULT_DROPDOWN },
  { label: "LOOKBOOK", slug: "lookbook", dropdown: DEFAULT_DROPDOWN },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ✅ New: drawers
  const [profileDrawer, setProfileDrawer] = useState(false);
  const [cartDrawer, setCartDrawer] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isScrolled = mounted ? scrolled : false;
  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <header
      className={`site-header fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isHomePage
          ? isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-md"
            : "bg-transparent"
          : "bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border-b border-gray-100"
      }`}
    >
      {/* Top Bar */}
      <div className="bg-[var(--brand-primary)] text-white text-center text-xs py-2 tracking-wide relative z-10">
        FREE SHIPPING ON ALL ORDERS OVER ₹1000
      </div>

      {/* Main Header */}
      <div className="w-full relative z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 lg:px-6 h-[96px] relative">
          {/* Left Section (Mobile: Menu + Search) */}
          <div className="flex items-center gap-3 lg:hidden z-50">
            <button onClick={toggleMenu}>
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
            <Search size={22} />
          </div>

          {/* Logo (Center on Mobile) */}
          <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 z-40">
            <Link href="/" className="flex items-center h-full w-40 sm:w-44 mx-auto">
              <div className="relative w-full h-12 flex items-center justify-center">
                <Image
                  src={
                    isHomePage && !isScrolled
                      ? "/images/logo.png"
                      : "/images/logo-dark.png"
                  }
                  alt="Gaza Arabia"
                  fill
                  priority
                  className="object-contain transition-opacity duration-300"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <nav
            className={`hidden lg:flex items-center h-full gap-8 text-[14px] font-medium tracking-wider uppercase ${
              isHomePage && !isScrolled
                ? "text-white"
                : "text-[var(--text-primary)]"
            }`}
          >
            {MENU_ITEMS.map((item, index) => (
              <div
                key={index}
                className="relative group h-full flex items-center"
                onMouseEnter={() => setActiveMenu(item.slug)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  href={`/${item.slug}`}
                  className="flex items-center h-full relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[var(--brand-primary)] group-hover:after:w-full after:transition-all after:duration-300 hover:text-[var(--brand-primary)] transition"
                >
                  {item.label}
                </Link>

                {/* Mega Menu */}
                {item.dropdown && activeMenu === item.slug && (
                  <div className="fixed left-0 right-0 top-[122px] bg-white text-[var(--text-primary)] shadow-xl pt-10 pb-12 border-t border-gray-200 animate-dropdown z-40">
                    <div className="mx-auto max-w-[1400px] px-10 grid grid-cols-4 gap-12">
                      {/* Scrollable Section - 2 Columns */}
                      <div className="col-span-2 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent pr-4">
                        <div className="grid grid-cols-2 gap-8">
                          {/* Collections */}
                          <div className="flex flex-col space-y-3 text-sm font-medium">
                            <h3 className="font-semibold mb-4 uppercase tracking-wide text-[13px] text-gray-800 border-b border-gray-100 pb-2">
                              Collections
                            </h3>
                            {item.dropdown.left.map((link, index) => (
                              <Link
                                key={index}
                                href="#"
                                className="hover:text-[var(--brand-primary)] transition-colors duration-200 hover:pl-1"
                              >
                                {link}
                              </Link>
                            ))}
                          </div>

                          {/* Categories */}
                          <div className="flex flex-col space-y-3 text-sm font-medium">
                            <h3 className="font-semibold mb-4 uppercase tracking-wide text-[13px] text-gray-800 border-b border-gray-100 pb-2">
                              Categories
                            </h3>
                            {item.dropdown.right.map((link, index) => (
                              <Link
                                key={index}
                                href="#"
                                className="hover:text-[var(--brand-primary)] transition-colors duration-200 hover:pl-1"
                              >
                                {link}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Banner Section */}
                      <div className="col-span-2 grid grid-cols-2 gap-6">
                        {item.dropdown.banners.map((banner, index) => (
                          <Link
                            href={banner.link}
                            key={index}
                            className="mega-menu-banner flex items-center justify-center h-[45vh] max-h-[400px] bg-gray-50 rounded-md shadow-sm hover:shadow-lg transition"
                          >
                            <div className="relative w-full h-full flex items-center justify-center">
                              <Image
                                src={banner.image}
                                alt={banner.title}
                                fill
                                priority
                                className="object-contain"
                              />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Section (Icons) */}
          <div
            className={`flex items-center gap-4 ${
              isHomePage && !isScrolled
                ? "text-white"
                : "text-[var(--text-primary)]"
            }`}
          >
            <div className="hidden lg:flex gap-4">
              <div className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] cursor-pointer transition">
                <Search size={20} />
              </div>

              <div
                onClick={() => setProfileDrawer(true)}
                className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] cursor-pointer transition"
              >
                <User size={20} />
              </div>

              <div 
              onClick={()=> router.push("/wishlist")}
              className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] cursor-pointer transition">
                <Heart size={20} />
              </div>

              <div
                onClick={() => setCartDrawer(true)}
                className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] cursor-pointer transition"
              >
                <ShoppingBag size={20} />
              </div>
            </div>

            {/* Mobile Right Icons */}
            <div className="flex lg:hidden gap-3">
              <User
                size={22}
                className="cursor-pointer"
                onClick={() => setProfileDrawer(true)}
              />
              <Heart size={22} className="cursor-pointer"   onClick={()=> router.push("/wishlist")} />
              <ShoppingBag
                size={22}
                className="cursor-pointer"
                onClick={() => setCartDrawer(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Side Drawer */}
          <div className="relative w-[80%] max-w-[320px] h-[100vh] bg-white shadow-xl animate-slideIn flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
              <button onClick={() => setIsOpen(false)} className="p-2">
                <X size={24} />
              </button>
              <Search size={22} className="ml-auto" />
            </div>

            <div className="px-4 py-3 border-b border-gray-200 text-sm flex items-center gap-2 shrink-0">
              <span>United Kingdom</span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 uppercase font-medium text-[var(--text-primary)] text-[14px] tracking-wide">
              {MENU_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center py-3 border-b border-gray-100"
                >
                  <Link href={`/${item.slug}`} onClick={() => setIsOpen(false)}>
                    {item.label}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500 shrink-0">
              © 2025 Gaza Arabia
            </div>
          </div>
        </div>
      )}

      {/* ✅ Drawers */}
      <ProfileDrawer isOpen={profileDrawer} onClose={() => setProfileDrawer(false)} />
      <CartDrawer isOpen={cartDrawer} onClose={() => setCartDrawer(false)} />
    </header>
  );
}
