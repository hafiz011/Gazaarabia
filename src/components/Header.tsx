"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, User, Heart, ShoppingBag, Loader, ChevronRight, ArrowLeft } from "lucide-react";
import ProfileDrawer from "@/components/ProfileDrawer";
import CartDrawer from "@/components/CartDrawer";
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/CartContext";
import MobileMenuDrawer from "./MobileMenuDrawer";
import { FaFacebookF, FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { getAllProducts } from "@/lib/services/front-end/productService";
import ProductCard from "./ProductCard";
import { fbEvent } from "@/components/analytics/FacebookPixel";
import { gaEvent } from "@/components/analytics/GoogleAnalytics";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Subcategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  image?: string;
  subcategories: Subcategory[];
}

interface Submenu {
  id: number;
  name: string;
  slug: string;
  categories: Category[];
}

interface BannerItem {
  image: string;
  title: string;
  link: string;
}

interface MenuDropdown {
  submenus: Submenu[];
  banners: BannerItem[];
}

interface MenuItem {
  id: number;
  name: string;
  slug: string;
  type: string;
  dropdown: MenuDropdown;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { data: session } = useSession();
  const { cartCount } = useCart();

  // Navigation State
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<Submenu | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // UI State
  const [toolbarText, setToolbarText] = useState<string>("");
  const [hovered, setHovered] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileDrawer, setProfileDrawer] = useState(false);
  const [cartDrawer, setCartDrawer] = useState(false);

  // Search State
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [productsData, setProductsData] = useState<any>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Refs for hover timing
  const hoverOpenRef = useRef<NodeJS.Timeout | null>(null);
  const hoverCloseRef = useRef<NodeJS.Timeout | null>(null);

  // Menu Navigation Helpers
  const getMenuLink = useCallback((menu: MenuItem) => {
    if (menu.type === "blog") return "/blogs/journal";
    if (menu.type === "product") return `/shop/${menu.slug}`;
    return "/";
  }, []);

  const getSubmenuLink = useCallback((menu: MenuItem, link: any) => {
    if (menu.type === "blog") return `/blogs/journal/${link.slug}`;
    return `/shop/${link.slug}`;
  }, []);

  // Toggle Handlers (Click-based)
  // Toggle Handlers (Click-based)
  const closeAllMenus = useCallback(() => {
    if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current);
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);

    setActiveMenu(null);
    setActiveSubmenu(null);
    setActiveCategory(null);
  }, []);

  const handleMenuHover = (menu: MenuItem) => {
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);
    if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current);

    // Intent delay for top level - reduced for snappier feel
    hoverOpenRef.current = setTimeout(() => {
      setActiveMenu(menu);
      setActiveSubmenu(null);
      setActiveCategory(null);
    }, 20);
  };


  const handleSubmenuHover = (sub: Submenu) => {
    if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current);

    // Snappier but still debounced for sub-levels
    setActiveSubmenu(sub);
    setActiveCategory(null);
  };

  const handleCategoryHover = (cat: Category) => {
    setActiveCategory(cat);
  };

  const cancelClose = useCallback(() => {
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);
  }, []);

  const scheduleClose = useCallback(() => {
    if (hoverOpenRef.current) clearTimeout(hoverOpenRef.current);
    if (hoverCloseRef.current) clearTimeout(hoverCloseRef.current);

    hoverCloseRef.current = setTimeout(() => {
      closeAllMenus();
    }, 20);
  }, [closeAllMenus]);





  // Fetch menu data
  const fetchMenus = useCallback(async () => {
    try {
      const res = await fetch("/api/header", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setMenus(data.data);
        if (data.headerText) setToolbarText(data.headerText);
      }
    } catch (err) {
      console.error("Failed to load menus:", err);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
    setMounted(true);
  }, [fetchMenus]);

  // Handle Escape key to close menus
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAllMenus();
        setSearchMode(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [closeAllMenus]);


  // Scroll handler with RequestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;
    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Search Debounce (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 20);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Search API Call
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setProductsData(null);
      setSearchLoading(false);
      return;
    }
    const fetchSearch = async () => {
      setSearchLoading(true);
      try {
        const res = await getAllProducts(debouncedQuery, true);
        setProductsData(res);
        
        // Tracking
        if (res?.products?.length > 0) {
          fbEvent("Search", { search_string: debouncedQuery });
          gaEvent("search", "Search", debouncedQuery);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    };
    fetchSearch();
  }, [debouncedQuery]);

  // Body scroll lock
  useEffect(() => {
    if (searchMode || isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchMode, isMobileMenuOpen]);






  // Header styles based on state
  const headerBaseClass = "fixed top-0 left-0 w-full z-[100] transition-all duration-300";
  const headerBgClass = isHomePage
    ? scrolled
      ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20"
      : hovered || activeMenu
        ? "bg-white/40 backdrop-blur-2xl shadow-sm border-b border-white/10"
        : "bg-transparent"
    : "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-100";

  const textColorClass = isHomePage && !scrolled && !hovered && !activeMenu && !searchMode
    ? "text-white"
    : "text-[var(--text-primary)]";

  return (
    <>
      <header
        className={`${headerBaseClass} ${headerBgClass}`}
        onMouseEnter={() => {
          setHovered(true);
          cancelClose();
        }}
        onMouseLeave={() => {
          setHovered(false);
          scheduleClose();
        }}
      >
        {/* TOP BAR */}
        <div
          className={`bg-[var(--brand-primary)] text-white text-[11px] py-1.5 tracking-[0.1em] transition-all duration-300 overflow-hidden ${scrolled ? "h-0 opacity-0" : "h-auto opacity-100"
            }`}
        >
          <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between uppercase font-bold">
            <span>{toolbarText || "Free shipping on orders over £100"}</span>
            <div className="hidden sm:flex gap-4 items-center">
              <Link href="https://instagram.com/gazaarabia" target="_blank"><FaInstagram /></Link>
              <Link href="https://facebook.com/gazaarabia" target="_blank"><FaFacebookF /></Link>
              <Link href="https://tiktok.com/@gazaarabia" target="_blank"><FaTiktok /></Link>
              <Link href="https://youtube.com/@gazaarabia" target="_blank"><FaYoutube /></Link>
            </div>
          </div>
        </div>

        {/* MAIN HEADER */}
        <div className="relative h-[70px] lg:h-[80px]">
          <div className="max-w-[1600px] mx-auto h-full flex items-center justify-between px-4 lg:px-10">
            {/* Left: Mobile Menu + Search */}
            <div className={`flex items-center gap-4 lg:hidden ${textColorClass}`}>
              <button onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={24} />
              </button>
              <button onClick={() => setSearchMode(true)}>
                <Search size={22} />
              </button>
            </div>

            {/* Logo */}
            <div className="flex items-center h-full">
              <Link href="/" className="relative w-32 lg:w-48 h-12 flex items-center justify-center">
                <Image
                  src={textColorClass === "text-white" ? "/images/logo.png" : "/images/logo-dark.png"}
                  alt="Gazaarabia"
                  fill
                  priority
                  sizes="(max-width: 768px) 128px, 192px"
                  className="object-contain"
                />
              </Link>
            </div>

            {/* Desktop Nav - Centered */}
            <nav className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center h-full gap-8 text-[13px] font-bold tracking-widest uppercase ${textColorClass}`}>
              {menus.map((item) => (
                <div
                  key={item.id}
                  className="h-full flex items-center relative group"
                  onMouseEnter={() => handleMenuHover(item)}
                >
                  <Link
                    href={getMenuLink(item)}
                    className={`hover:text-[var(--brand-primary)] transition-colors relative py-2 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[var(--brand-primary)] after:transition-all hover:after:w-full ${activeMenu?.id === item.id ? "text-[var(--brand-primary)] after:w-full" : ""}`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}
              <Link href="/become-partner" className="hover:text-[var(--brand-primary)] transition-colors">Ambassador</Link>
            </nav>

            {/* Right: Search, Account, Wishlist, Cart */}
            <div className={`flex items-center gap-2 lg:gap-5 ${textColorClass}`}>
              <button onClick={() => setSearchMode(true)} className="hidden lg:flex p-2 hover:bg-black/5 rounded-full transition">
                <Search size={20} />
              </button>
              <button onClick={() => setProfileDrawer(true)} className="p-2 hover:bg-black/5 rounded-full transition">
                <User size={22} />
              </button>
              <button onClick={() => router.push("/wishlist")} className="hidden lg:flex p-2 hover:bg-black/5 rounded-full transition">
                <Heart size={20} />
              </button>
              <button onClick={() => setCartDrawer(true)} className="relative p-2 hover:bg-black/5 rounded-full transition">
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-[var(--brand-primary)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* MEGA MENU: Stage 2 (Submenu Strip) */}
          <div
            className={`absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl transition-all duration-300 ease-out z-50 will-change-transform ${activeMenu && activeMenu.dropdown?.submenus?.length ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            onMouseEnter={cancelClose}
          >
            <div className="max-w-[1600px] mx-auto px-10 flex gap-6 overflow-x-auto no-scrollbar py-4">
              {activeMenu?.dropdown?.submenus.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onMouseEnter={() => handleSubmenuHover(sub)}
                  className={`px-6 py-2.5 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${activeSubmenu?.id === sub.id ? "bg-gray-900 text-white shadow-lg scale-105" : "text-gray-500 hover:bg-gray-100"
                    }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* MEGA MENU: Stage 3 (Categories + Subcategories + Banners) */}
            <div className={`bg-gray-50/50 transition-all duration-300 ease-out overflow-hidden ${activeMenu && activeSubmenu ? "max-h-[600px]" : "max-h-0"}`}>
              <div className="max-w-[1600px] mx-auto px-10 py-10 grid grid-cols-5 gap-12">
                {/* Categories Column */}
                <div className="col-span-1 space-y-1">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Collections</h4>
                  {activeSubmenu?.categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onMouseEnter={() => handleCategoryHover(cat)}
                      className={`w-full flex items-center justify-between text-[13px] uppercase tracking-wide py-2.5 px-4 rounded-lg transition-all duration-200 cursor-pointer ${activeCategory?.id === cat.id ? "bg-white shadow-md text-[var(--brand-primary)] font-bold translate-x-1" : "text-gray-600 hover:text-black hover:bg-white/50"
                        }`}
                    >
                      <span>{cat.name}</span>
                      {activeCategory?.id === cat.id && <ChevronRight size={14} className="animate-in fade-in slide-in-from-left-1" />}
                    </button>
                  ))}
                </div>

                {/* Subcategories Column */}
                <div className="col-span-1 ">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                    {activeCategory?.name || "Shop By"}
                  </h4>
                  <div className="grid grid-cols-1 gap-1">
                    {activeCategory?.subcategories.map((subcat) => (
                      <Link
                        key={subcat.id}
                        href={`/shop/${subcat.slug}`}
                        className="text-[13px] text-gray-600 hover:text-[var(--brand-primary)] py-2 px-3 rounded-md transition hover:bg-white/50"
                        onClick={() => closeAllMenus()}
                      >
                        {subcat.name}
                      </Link>
                    ))}
                    {activeCategory && (
                      <Link
                        href={`/shop/${activeCategory.slug}`}
                        className="text-[12px] font-bold text-[var(--brand-primary)] py-2 px-3 mt-2 inline-flex items-center gap-1 group"
                        onClick={() => closeAllMenus()}
                      >
                        View All <ChevronRight size={14} className="group-hover:translate-x-1 transition" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Banners Column */}
                <div className="col-span-3 grid grid-cols-2 gap-6">
                  {activeMenu?.dropdown.banners.slice(0, 2).map((banner, i) => (
                    <Link
                      key={i}
                      href={banner.link}
                      className="relative aspect-[16/9] rounded-xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-500"
                    >
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        sizes="(max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                        <span className="text-white text-[18px] font-black uppercase tracking-widest">{banner.title}</span>
                        <span className="text-white/80 text-[11px] uppercase font-bold tracking-widest mt-1">Explore Now</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FULL-WIDTH SEARCH OVERLAY */}
      <div className={`fixed inset-0 z-[200] bg-white transition-all duration-500 ${searchMode ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"}`}>
        <div className="h-full flex flex-col">
          {/* Search Header */}
          <div className="max-w-[1600px] mx-auto w-full px-4 lg:px-10 py-6 flex items-center gap-6 border-b border-gray-100">
            <button onClick={() => { setSearchMode(false); setSearchQuery(""); }} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft size={28} />
            </button>
            <div className="flex-1 flex items-center">
              <Search size={24} className="text-gray-400 mr-4" />
              <input
                autoFocus
                type="text"
                placeholder="WHAT ARE YOU LOOKING FOR?"
                className="w-full text-2xl lg:text-4xl font-bold uppercase tracking-widest outline-none border-none placeholder:text-gray-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchMode(false);
                  }
                }}
              />
            </div>
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-black">
                <X size={32} />
              </button>
            )}
          </div>

          {/* Search Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-12">
            <div className="max-w-[1600px] mx-auto px-4 lg:px-10">
              {searchLoading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Loader className="animate-spin text-[var(--brand-primary)]" size={48} />
                  <span className="text-sm font-bold tracking-[0.3em] text-gray-400 uppercase">Searching...</span>
                </div>
              ) : productsData?.products?.length > 0 ? (
                <div className="space-y-12">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h3 className="text-sm font-black tracking-[0.2em] uppercase text-gray-400">Results ({productsData.total})</h3>
                    <button
                      onClick={() => {
                        router.push(`/search?q=${searchQuery}`);
                        setSearchMode(false);
                      }}
                      className="text-[12px] font-bold uppercase tracking-widest text-[var(--brand-primary)] hover:underline"
                    >
                      View All Results
                    </button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
                    {productsData.products.slice(0, 10).map((product: any) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onCardClick={() => setSearchMode(false)}
                      />
                    ))}
                  </div>
                </div>
              ) : debouncedQuery.length >= 2 ? (
                <div className="text-center py-24">
                  <p className="text-2xl font-bold text-gray-300 tracking-widest uppercase">No results found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-4 uppercase tracking-widest">Try different keywords or check your spelling</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Trending Categories</h3>
                    <div className="flex flex-wrap gap-3">
                      {["Abayas", "Kaftans", "Hijabs", "New In", "Sale"].map(cat => (
                        <Link
                          key={cat}
                          href={`/shop/${cat.toLowerCase()}`}
                          className="px-6 py-3 border border-gray-200 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                          onClick={() => setSearchMode(false)}
                        >
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MENU BACKDROP */}
      {activeMenu && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[90] transition-all duration-300 animate-in fade-in pointer-events-none"
        />
      )}



      {/* Mobile Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        menus={menus}
        getMenuLink={getMenuLink}
        getSubmenuLink={getSubmenuLink}
      />

      {/* Other Drawers */}
      <ProfileDrawer isOpen={profileDrawer} onClose={() => setProfileDrawer(false)} />
      <CartDrawer isOpen={cartDrawer} onClose={() => setCartDrawer(false)} />
    </>
  );
}