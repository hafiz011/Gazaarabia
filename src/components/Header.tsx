"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, Search, User, Heart, ShoppingBag, Loader } from "lucide-react";
import ProfileDrawer from "@/components/ProfileDrawer";
import CartDrawer from "@/components/CartDrawer";
import { useSession } from "next-auth/react";
import { useCart } from "@/app/context/CartContext";
import MobileMenuDrawer from "./MobileMenuDrawer";
import { FaFacebookF, FaInstagram, FaYoutube, FaPinterestP } from "react-icons/fa";
import { getAllProducts } from "@/lib/services/front-end/productService";
import ProductCard from "./ProductCard";


interface SubcategoryLink {
  id?: number;
  name: string;
  slug: string;
  isCustom?: boolean;
}

interface BannerItem {
  image: string;
  title: string;
  link: string;
}

interface DropdownMenu {
  left: SubcategoryLink[];
  right: SubcategoryLink[];
  banners: BannerItem[];
}

interface MenuItem {
  id: number;
  name: string;
  slug: string;
  type: string;
  dropdown?: DropdownMenu | null;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const { data: session } = useSession();
  const token = session?.user?.token || null;

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [toolbarText, setToolbarText] = useState<any>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [profileDrawer, setProfileDrawer] = useState(false);
  const [cartDrawer, setCartDrawer] = useState(false);
  const [hovered, setHovered] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [productsData, setProductsData] = useState<any>(null);
  const [debouncedQuery, setDebouncedQuery] = useState("");


  const { cartCount } = useCart();

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/header", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setMenus(data.data);
      if (data?.headerText) {
        setToolbarText(data?.headerText)
      }
    } catch (err) {
      console.error("Failed to load menus:", err);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const isScrolled = mounted ? scrolled : false;

  const getMenuLink = (menu: MenuItem) => {
    if (menu.type === "blog") return "/blogs/journal";
    if (menu.type === "product") return `/shop/${menu.slug}`;
    return "/";
  };

  const getSubmenuLink = (menu: MenuItem, link: SubcategoryLink) => {
    if (menu.type === "blog") return `/blogs/journal/${link.slug}`;
    return `/shop/${link.slug}`;
  };

  const searchBtn = () => {
    console.log('open the search bar!')
    setSearchMode(true)
  }

  useEffect(() => {
    if (searchMode) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // important for mobile
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [searchMode]);


  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);


  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < 2) {
      setProductsData(null);
      setSearchLoading(false);
      return;
    }
    const fetch = async () => {
      setSearchLoading(true);
      const res = await getAllProducts(debouncedQuery, true);
      setProductsData(res);
      setSearchLoading(false);
    };

    fetch();
  }, [debouncedQuery]);

  const searchProduct = (search: string) => {
    setSearchQuery(search);
  };


  return (
    <header
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`site-header fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isHomePage
        ? isScrolled
          ? "bg-white/60 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] border-b border-white/30"   // scrolled
          : hovered
            ? "bg-white/25 backdrop-blur-2xl border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.06)] transition-all"  // hover
            : "bg-transparent"  // fresh hero section
        : "bg-white/70 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gray-200"  // other pages
        }
`}
    >
      {/*Top Bar */}
      {/* {toolbarText &&
        <div className="bg-[var(--brand-primary)] text-white text-center text-xs py-2 tracking-wide relative z-10">
          {toolbarText}
        </div>
      } */}

      {/* {toolbarText && ( */}
      <div className="bg-[var(--brand-primary)] text-white text-xs py-2 tracking-wide relative z-10">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center justify-between">

          {/* LEFT TEXT */}
          <span className="font-medium">
            {toolbarText}
          </span>

          {/* RIGHT SOCIAL ICONS */}
          <div className="hidden sm:flex gap-4 items-center">
            <Link href="https://facebook.com" target="_blank">
              <FaFacebookF className="text-white text-sm hover:opacity-80 transition cursor-pointer" />
            </Link>
            <Link href="https://instagram.com" target="_blank">
              <FaInstagram className="text-white text-sm hover:opacity-80 transition cursor-pointer" />
            </Link>
            <Link href="https://youtube.com" target="_blank">
              <FaYoutube className="text-white text-sm hover:opacity-80 transition cursor-pointer" />
            </Link>
            <Link href="https://pinterest.com" target="_blank">
              <FaPinterestP className="text-white text-sm hover:opacity-80 transition cursor-pointer" />
            </Link>
          </div>

        </div>
      </div>
      {/* )} */}



      {/* Main Header */}
      <div className="w-full relative z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 lg:px-6 h-[96px] relative">
          {/* Mobile Menu Button + Search */}
          {/* <div className="flex items-center gap-3 lg:hidden z-50">
            <button onClick={toggleMenu}>
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
            <Search size={22} />
          </div> */}


          <div
            className={`flex items-center gap-3 lg:hidden z-50 ${isHomePage && (!isScrolled && !hovered)
              ? "text-white"
              : "text-[var(--text-primary)]"
              }`}
          >
            <button onClick={toggleMenu} className="transition-colors duration-300">
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
            {/* <Search size={22} className="transition-colors duration-300" /> */}

            <Search
              size={22}
              className="transition-colors duration-300 cursor-pointer"
              onClick={() => { setSearchMode(true); setHovered(true) }}
            />


          </div>


          {/* Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 z-40">
            <Link href="/" className="flex items-center h-full w-40 sm:w-44 mx-auto">
              <div className="relative w-full h-12 flex items-center justify-center">
                <Image
                  src={
                    isHomePage && (!isScrolled && !hovered)
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

          {/*  Desktop Menu */}

          {searchMode && (
            <div className="hidden lg:flex w-full max-w-3xl items-center border-b border-gray-300 focus-within:border-black transition-colors duration-200 search-bar">
              {/* <Search className="mr-3 text-gray-400" size={20} /> */}

              <input
                autoFocus
                type="text"
                placeholder="Search products..."
                className="
                  flex-1
                  h-12
                  bg-transparent
                  outline-none
                  border-none
                  ring-0
                  focus:ring-0
                  focus:outline-none
                  text-lg
                  placeholder-gray-400
                "
                value={searchQuery}
                onChange={(e) => { searchProduct(e.target.value) }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchMode(false);
                  }
                }}
              />

              <button
                onClick={() => { setSearchMode(false); setSearchQuery("") }}
                className="ml-3 p-2 hover:bg-black/5 rounded-full transition"
              >
                <X size={22} />
              </button>



              {/* <div className="fixed left-0 right-0 top-[122px] bg-white text-[var(--text-primary)] shadow-xl pt-10 pb-12 border-t border-gray-200 animate-dropdown z-40"> */}

              {debouncedQuery && debouncedQuery.length >= 2 && productsData &&
                <div className="
                  fixed 
                  left-0 
                  right-0 
                  top-[122px] 
                  bg-white 
                  text-[var(--text-primary)] 
                  shadow-xl 
                  pt-10 
                  pb-12 
                  border-gray-200 
                  animate-dropdown 
                  z-40
                  max-h-[80vh]
                  overflow-y-auto
                ">

                  <div className="mx-auto max-w-[1600px] px-10 min-h-[300px]">

                    {searchLoading ? (
                      <div className="flex items-center justify-center min-h-[300px]">
                        <Loader className="animate-spin" size={40} />
                      </div>
                    ) : (
                      <div className="w-full">

                        {/* PRODUCTS GRID */}
                        {(productsData?.products?.length > 0) ?
                          <div
                            className="
                            grid 
                            grid-cols-2
                            sm:grid-cols-2
                            md:grid-cols-3
                            lg:grid-cols-3
                            xl:grid-cols-4
                            2xl:grid-cols-5
                            gap-x-6 gap-y-12
                            justify-items-stretch
                            w-full
                          "
                          >
                            {productsData?.products?.map((product: any) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                onCardClick={() => setSearchMode(false)}
                              />
                            ))}
                          </div>

                          :
                          <>
                            <div className="w-full pt-16 pb-10 text-center">
                              <p className="mt-3 text-sm tracking-wide text-gray-600 max-w-xl mx-auto">
                                No search results for <span className="italic">"{searchQuery}"</span>.<br />
                                Please try searching again using different words.
                              </p>
                            </div>
                          </>
                        }



                        {/* VIEW ALL BUTTON */}
                        {(productsData?.total > 5) &&
                          <div className="mt-10 flex justify-center">
                            <button
                              onClick={() => {
                                router.push(`/search?q=${searchQuery}`);
                                setSearchMode(false);
                              }}
                              className="
                              text-sm
                              tracking-widest
                              uppercase
                              text-gray-800
                              border-b
                              border-gray-400
                              hover:border-black
                              hover:text-black
                              transition
                              pb-1
                            "
                            >
                              View all {productsData?.total} products
                            </button>
                          </div>
                        }


                      </div>
                    )}

                  </div>
                </div>

              }






            </div>
          )}


          {!searchMode && (

            <nav
              className={`hidden lg:flex items-center h-full gap-8 text-[14px] font-medium tracking-wider uppercase ${isHomePage && (!isScrolled && !hovered)
                ? "text-white"
                : "text-[var(--text-primary)]"
                }`}
            >
              {/* Dynamic Menus from API */}
              {menus.map((item) => (
                <div
                  key={item.id}
                  className="relative group h-full flex items-center"
                  // onMouseEnter={() => setActiveMenu(item.slug)}
                  // onMouseLeave={() => setActiveMenu(null)}
                  onMouseEnter={() => {
                    if (item.dropdown) {
                      setActiveMenu(item.slug);   // open dropdown
                    } else {
                      setActiveMenu(null);        // close dropdown
                    }
                  }}

                >
                  <Link
                    href={getMenuLink(item)}
                    className="flex items-center h-full relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[var(--brand-primary)] group-hover:after:w-full after:transition-all after:duration-300 hover:text-[var(--brand-primary)] transition"
                  >
                    {item.name}
                  </Link>

                  {/*  Mega Menu */}
                  {item.dropdown && activeMenu === item.slug && (
                    // <div className="fixed left-0 right-0 top-[122px] bg-white text-[var(--text-primary)] shadow-xl pt-10 pb-12 border-t border-gray-200 animate-dropdown z-40">

                    <div
                      className="fixed left-0 right-0 top-[122px] bg-white text-[var(--text-primary)] shadow-xl pt-10 pb-12 border-t border-gray-200 animate-dropdown z-40"
                      onMouseEnter={() => setActiveMenu(item.slug)}  // keep open
                      onMouseLeave={() => setActiveMenu(null)}       // close when user leaves mega menu
                    >
                      <div className="mx-auto max-w-[1400px] px-10 grid grid-cols-4 gap-12">
                        <div className="col-span-2 max-h-[55vh] overflow-y-auto pr-4">
                          <div className="grid grid-cols-2 gap-8">
                            {/* Left */}
                            <div className="flex flex-col space-y-3 text-sm font-medium">
                              {item.dropdown.left.map((link, index) => (
                                <Link
                                  key={link.slug}
                                  href={getSubmenuLink(item, link)}
                                  className="hover:text-[var(--brand-primary)] transition-colors duration-200 hover:pl-1"
                                >
                                  {link.name}
                                </Link>
                              ))}
                            </div>
                            {/* Right */}
                            <div className="flex flex-col space-y-3 text-sm font-medium">
                              {item.dropdown.right.map((link) => (
                                <Link
                                  key={link.slug}
                                  href={getSubmenuLink(item, link)}
                                  className="hover:text-[var(--brand-primary)] transition-colors duration-200 hover:pl-1"
                                >
                                  {link.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Banners */}
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


              {/* -------------------------------------- */}
              {/* FIXED MENU ITEMS (Always Visible)      */}
              {/* -------------------------------------- */}

              {/* PARTNER */}
              <Link
                href="/become-partner"
                onMouseEnter={() => setActiveMenu(null)}
                className="flex items-center h-full relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-[var(--brand-primary)] hover:after:w-full after:transition-all after:duration-300 hover:text-[var(--brand-primary)] transition"
              >
                Partner
              </Link>

            </nav>

          )}

          {/*  Right Icons (Desktop + Mobile) */}
          <div
            className={`flex items-center gap-4 ${isHomePage && (!isScrolled && !hovered)
              ? "text-white"
              : "text-[var(--text-primary)]"
              }`}
          >
            {/* Desktop Icons */}
            <div className="hidden lg:flex gap-4">
              {/* <div className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 cursor-pointer transition">
                <Search size={20} />
              </div> */}

              <div
                onClick={() => searchBtn()}
                className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 cursor-pointer transition"
              >
                <Search size={20} />
              </div>

              <div
                onClick={() => setProfileDrawer(true)}
                className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 cursor-pointer transition"
              >
                <User size={20} />
              </div>

              <div
                onClick={() => router.push("/wishlist")}
                className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 cursor-pointer transition"
              >
                <Heart size={20} />
              </div>

              <div
                onClick={() => setCartDrawer(true)}
                className="relative p-2 rounded-full hover:bg-[var(--brand-primary)]/10 cursor-pointer transition"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[var(--brand-primary)] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Icons */}
            <div className="flex lg:hidden gap-3">
              <User
                size={22}
                className="cursor-pointer"
                onClick={() => setProfileDrawer(true)}
              />
              <Heart
                size={22}
                className="cursor-pointer"
                onClick={() => router.push("/wishlist")}
              />
              <div
                onClick={() => setCartDrawer(true)}
                className="relative cursor-pointer"
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[var(--brand-primary)] text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* ===== MOBILE SEARCH ROW ===== */}
      {searchMode && (
        <div className="lg:hidden w-full bg-white border-t border-gray-200 px-4 py-3 z-40">

          <div className="flex items-center gap-3 search-bar">
            <button onClick={() => { setSearchMode(false); setSearchQuery("") }}>
              <X size={22} />
            </button>

            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchMode(false);
                }
              }}
              className="flex-1 h-11 bg-transparent outline-none text-base placeholder-gray-400"
            />
          </div>

        </div>
      )}

      {/* ===== MOBILE SEARCH RESULTS OVERLAY ===== */}
      {searchMode && debouncedQuery.length >= 2 && (
        <div className="
                lg:hidden
                  fixed 
                  left-0 
                  right-0 
                   top-[180px]
                  
                  bg-white 
                  text-[var(--text-primary)] 
                  shadow-xl 
                  pt-5
                  pb-12 
                  border-gray-200 
                  animate-dropdown 
                  z-40
                  max-h-[80vh]
                  overflow-y-auto
                ">

          <div className="mx-auto max-w-[1600px] px-10 min-h-[300px]">
            {searchLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="animate-spin" size={32} />
              </div>
            ) : productsData?.products?.length > 0 ? (

              <>
                <div className="p-4 grid grid-cols-2 gap-4">
                  {productsData.products.map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onCardClick={() => setSearchMode(false)}
                    />
                  ))}
                </div>

                {/* VIEW ALL BUTTON */}
                {(productsData?.total > 5) &&
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={() => {
                        router.push(`/search?q=${searchQuery}`);
                        setSearchMode(false);
                      }}
                      className="
                              text-sm
                              tracking-widest
                              uppercase
                              text-gray-800
                              border-b
                              border-gray-400
                              hover:border-black
                              hover:text-black
                              transition
                              pb-1
                            "
                    >
                      View all {productsData?.total} products
                    </button>
                  </div>
                }

              </>

            ) : (

              <>
                <div className="w-full pt-16 pb-10 text-center">
                  <p className="mt-3 text-sm tracking-wide text-gray-600 max-w-xl mx-auto">
                    No search results for <span className="italic">"{searchQuery}"</span>.<br />
                    Please try searching again using different words.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}



      {/*  Drawers */}
      <ProfileDrawer isOpen={profileDrawer} onClose={() => setProfileDrawer(false)} />
      <CartDrawer isOpen={cartDrawer} onClose={() => setCartDrawer(false)} />

      <MobileMenuDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        menus={menus}
        getMenuLink={getMenuLink}
      />
    </header>
  );
}
