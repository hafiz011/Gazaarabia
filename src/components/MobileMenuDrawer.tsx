"use client";

import { useEffect, useState, useCallback, memo } from "react";
import Link from "next/link";
import { X, ArrowLeft, ChevronRight, User, Heart, ShoppingBag, Settings } from "lucide-react";
import { FaInstagram, FaFacebookF, FaTiktok, FaYoutube } from "react-icons/fa";

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

interface MenuItem {
  id: number;
  name: string;
  slug: string;
  type: string;
  dropdown: {
    submenus: Submenu[];
    banners: any[];
  };
}

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menus: MenuItem[];
  getMenuLink: (menu: MenuItem) => string;
  getSubmenuLink: (menu: MenuItem, link: any) => string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  menus,
  getMenuLink,
  getSubmenuLink,
}: MobileMenuDrawerProps) {
  // Navigation State - 4 levels as required
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<Submenu | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mounting and body scroll lock
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      timer = setTimeout(() => {
        setIsMounted(false);
        resetNavigation();
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const resetNavigation = useCallback(() => {
    setActiveMenu(null);
    setActiveSubmenu(null);
    setActiveCategory(null);
  }, []);

  const handleBack = useCallback(() => {
    if (activeCategory) {
      setActiveCategory(null);
    } else if (activeSubmenu) {
      setActiveSubmenu(null);
    } else if (activeMenu) {
      setActiveMenu(null);
    }
  }, [activeMenu, activeSubmenu, activeCategory]);

  // Transform calculation: translateX(-${currentPanel * 25}%)
  const currentPanel = activeCategory ? 3 : activeSubmenu ? 2 : activeMenu ? 1 : 0;

  if (!isMounted && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-[300] lg:hidden transition-all duration-300 ${isOpen ? "visible" : "invisible"}`}>
      {/* Backdrop with Blur */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Drawer Panel: 85% width, max 400px */}
      <div
        className={`absolute top-0 left-0 h-full w-[85%] max-w-[400px] bg-white shadow-[20px_0_60px_rgba(0,0,0,0.1)] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* HEADER: Dynamic level name + Back/Close */}
        <div className="flex items-center justify-between px-6 h-[70px] border-b border-gray-50 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {(activeMenu || activeSubmenu || activeCategory) && (
              <button
                onClick={handleBack}
                className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={22} className="text-gray-900" />
              </button>
            )}
            <h2 className="text-[14px] font-black tracking-[0.2em] uppercase text-gray-900">
              {activeCategory
                ? activeCategory.name
                : activeSubmenu
                  ? activeSubmenu.name
                  : activeMenu
                    ? activeMenu.name
                    : "Navigation"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-gray-50 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X size={26} className="text-gray-900" />
          </button>
        </div>

        {/* CONTENT AREA: 4 sliding panels at 25% each */}
        <div className="flex-1 overflow-hidden relative overscroll-contain">
          <div
            className="flex w-[400%] h-full transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) will-change-transform"
            style={{ transform: `translateX(-${currentPanel * 25}%)` }}
          >
            {/* PANEL 0: Main Menus + Account */}
            <div className="w-1/4 h-full overflow-y-auto no-scrollbar flex-shrink-0 bg-white">
              <div className="py-6">
                <div className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Departments</div>
                {menus.map((menu) => (
                  <MenuListItem
                    key={menu.id}
                    label={menu.name}
                    onClick={() => {
                      if (menu.dropdown?.submenus?.length) {
                        setActiveMenu(menu);
                      } else {
                        onClose();
                      }
                    }}
                    href={menu.dropdown?.submenus?.length ? undefined : getMenuLink(menu)}
                    hasArrow={menu.dropdown?.submenus?.length > 0}
                  />
                ))}

                <div className="mt-8 pt-8 border-t border-gray-50">
                  <div className="px-8 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Member Space</div>
                  <MenuListItem label="My Profile" icon={<User size={20} />} href="/account/details" onClick={onClose} hasArrow={false} />
                  <MenuListItem label="Wishlist" icon={<Heart size={20} />} href="/wishlist" onClick={onClose} hasArrow={false} />
                  <MenuListItem label="Shopping Bag" icon={<ShoppingBag size={20} />} href="/cart" onClick={onClose} hasArrow={false} />
                  <MenuListItem label="Ambassador" icon={<Settings size={20} />} href="/become-partner" onClick={onClose} hasArrow={false} />
                </div>
              </div>
            </div>

            {/* PANEL 1: Submenus */}
            <div className="w-1/4 h-full overflow-y-auto no-scrollbar border-l border-gray-50 flex-shrink-0 bg-white">
              {activeMenu && (
                <div className="py-6">
                  <Link
                    href={getMenuLink(activeMenu)}
                    onClick={onClose}
                    className="flex items-center px-8 py-5 text-[14px] font-black text-[var(--brand-primary)] uppercase tracking-widest bg-gray-50/50 mb-2"
                  >
                    Explore {activeMenu.name}
                  </Link>
                  {activeMenu.dropdown.submenus.map((submenu) => (
                    <MenuListItem
                      key={submenu.id}
                      label={submenu.name}
                      onClick={() => {
                        if (submenu.categories?.length) {
                          setActiveSubmenu(submenu);
                        } else {
                          onClose();
                        }
                      }}
                      href={submenu.categories?.length ? undefined : getSubmenuLink(activeMenu, submenu)}
                      hasArrow={submenu.categories?.length > 0}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* PANEL 2: Categories */}
            <div className="w-1/4 h-full overflow-y-auto no-scrollbar border-l border-gray-50 flex-shrink-0 bg-white">
              {activeMenu && activeSubmenu && (
                <div className="py-6">
                  <Link
                    href={getSubmenuLink(activeMenu, activeSubmenu)}
                    onClick={onClose}
                    className="flex items-center px-8 py-5 text-[14px] font-black text-[var(--brand-primary)] uppercase tracking-widest bg-gray-50/50 mb-2"
                  >
                    {activeSubmenu.name} All
                  </Link>
                  {activeSubmenu.categories.map((category) => (
                    <MenuListItem
                      key={category.id}
                      label={category.name}
                      onClick={() => {
                        if (category.subcategories?.length) {
                          setActiveCategory(category);
                        } else {
                          onClose();
                        }
                      }}
                      href={category.subcategories?.length ? undefined : getSubmenuLink(activeMenu, category)}
                      hasArrow={category.subcategories?.length > 0}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* PANEL 3: Subcategories */}
            <div className="w-1/4 h-full overflow-y-auto no-scrollbar border-l border-gray-50 flex-shrink-0 bg-white">
              {activeMenu && activeSubmenu && activeCategory && (
                <div className="py-6">
                  <Link
                    href={getSubmenuLink(activeMenu, activeCategory)}
                    onClick={onClose}
                    className="flex items-center px-8 py-5 text-[14px] font-black text-[var(--brand-primary)] uppercase tracking-widest bg-gray-50/50 mb-2"
                  >
                    {activeCategory.name} Overview
                  </Link>
                  {activeCategory.subcategories?.length > 0 ? (
                    activeCategory.subcategories.map((subcat) => (
                      <MenuListItem
                        key={subcat.id}
                        label={subcat.name}
                        href={getSubmenuLink(activeMenu, subcat)}
                        onClick={onClose}
                        hasArrow={false}
                      />
                    ))
                  ) : (
                    <div className="px-8 py-12 text-center text-[12px] font-bold text-gray-400 uppercase tracking-widest">
                      No collections found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER: Social Icons */}
        <div className="p-8 border-t border-gray-50 bg-gray-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Stay Connected</span>
            <div className="flex gap-6">
              <a href="https://instagram.com/gazaarabia" target="_blank" className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"><FaInstagram size={20} /></a>
              <a href="https://facebook.com/gazaarabia" target="_blank" className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"><FaFacebookF size={18} /></a>
              <a href="https://tiktok.com/@gazaarabia" target="_blank" className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"><FaTiktok size={18} /></a>
              <a href="https://youtube.com/@gazaarabia" target="_blank" className="text-gray-400 hover:text-[var(--brand-primary)] transition-colors"><FaYoutube size={20} /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface MenuListItemProps {
  label: string;
  onClick?: () => void;
  href?: string;
  hasArrow?: boolean;
  icon?: React.ReactNode;
}

const MenuListItem = memo(({ label, onClick, href, hasArrow = true, icon }: MenuListItemProps) => {
  const content = (
    <div className="flex items-center justify-between w-full px-8 py-5 group transition-all duration-300">
      <div className="flex items-center gap-5">
        {icon && <div className="text-gray-300 group-hover:text-[var(--brand-primary)] transition-colors">{icon}</div>}
        <span className="text-[14px] font-bold tracking-widest text-gray-700 group-hover:text-black uppercase transition-colors">
          {label}
        </span>
      </div>
      {hasArrow && (
        <ChevronRight size={18} className="text-gray-300 group-hover:text-[var(--brand-primary)] transition-all duration-300 group-hover:translate-x-1" />
      )}
    </div>
  );

  const className = "block w-full text-left hover:bg-gray-50/50 transition-colors border-b border-gray-50/50";

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
});

MenuListItem.displayName = "MenuListItem";