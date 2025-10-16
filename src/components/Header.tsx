"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Search, User, Heart, ShoppingBag } from "lucide-react";

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

// ========== Shared Dropdown Structure ==========
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
        "All Collections",
        "All Collections",
        "Abayas",
        "Coats & Cover-ups",
        "Co-ords",
        "Athleisure",
        "Hoodies",
        "Loungewear",
        "Winter Scarves",
        "Back in Stock",
        "All Collections",
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
        {
            image: "/images/header/arrivals.png",
            title: "New Arrivals",
            link: "/new-arrivals",
        },
        {
            image: "/images/header/coats-coverup.png",
            title: "Coats & Cover-ups",
            link: "/coats",
        },
    ],
};

// ========== Menu Data ==========
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
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    const [isOpen, setIsOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

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
            className={`site-header fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isHomePage
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

            {/* Main Section */}
            <div className="w-full relative z-10">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 h-[96px] relative">
                    {/* Logo */}
                    <Link href="/" className="flex items-center h-full w-44">
                        <div className="relative w-full h-12 flex items-center">
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

                    {/* Nav Menu */}
                    <nav
                        className={`hidden lg:flex items-center h-full gap-8 text-[14px] font-medium tracking-wider uppercase ${isHomePage && !isScrolled
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
                                    <div className="fixed left-0 right-0 top-[122px] bg-white text-[var(--text-primary)] shadow-xl pt-14 pb-16 border-t border-gray-200 animate-dropdown z-40">
                                        <div className="mx-auto max-w-[1400px] px-10 grid grid-cols-4 gap-12">
                                            {/* Scrollable Section - 2 Columns (Collections + Categories) */}
                                            <div className="col-span-2 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-4">
                                                <div className="grid grid-cols-2 gap-10">
                                                    {/* Collections Column */}
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

                                                    {/* Categories Column */}
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

                                            {/* Banner Section - Fixed */}
                                            <div className="col-span-2 grid grid-cols-2 gap-6">
                                                {item.dropdown.banners.map((banner, index) => (
                                                    <Link
                                                        href={banner.link}
                                                        key={index}
                                                        className="mega-menu-banner relative h-[500px] overflow-hidden group rounded-md shadow-sm hover:shadow-lg transition"
                                                    >
                                                        <Image
                                                            src={banner.image}
                                                            alt={banner.title}
                                                            fill
                                                            priority
                                                            className="image-fill object-cover"
                                                        />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Right Icons */}
                    <div
                        className={`hidden lg:flex items-center justify-center h-full gap-4 ${isHomePage && !isScrolled
                            ? "text-white"
                            : "text-[var(--text-primary)]"
                            }`}
                    >
                        {[Search, User, Heart, ShoppingBag].map((Icon, i) => (
                            <div
                                key={i}
                                className="p-2 rounded-full hover:bg-[var(--brand-primary)]/10 hover:text-[var(--brand-primary)] cursor-pointer transition"
                            >
                                <Icon size={20} />
                            </div>
                        ))}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={toggleMenu}
                        className={`lg:hidden flex items-center justify-center h-full transition-colors duration-300 ${isHomePage && !isScrolled
                            ? "text-white"
                            : "text-[var(--text-primary)]"
                            }`}
                    >
                        {isOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200">
                    <nav className="flex flex-col p-4 space-y-2 text-center text-[var(--text-primary)] uppercase font-medium">
                        {MENU_ITEMS.map((item, index) => (
                            <Link
                                key={index}
                                href={`/${item.slug}`}
                                className="py-3 hover:text-[var(--brand-primary)] transition"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
