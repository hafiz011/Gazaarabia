"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import { X, ArrowLeft, ChevronRight, ChevronDown } from "lucide-react";

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
// NESTED COMPONENTS (Memoized for Performance)
// ============================================================================

interface CategoryItemProps {
  category: Category;
  isExpanded: boolean;
  onToggle: () => void;
  onCategorySelect: (category: Category) => void;
  onNavigate: (path: string) => void;
  activeMenu: MenuItem;
  getSubmenuLink: (menu: MenuItem, link: any) => string;
}

const CategoryItem = memo(function CategoryItem({
  category,
  isExpanded,
  onToggle,
  onCategorySelect,
  onNavigate,
  activeMenu,
  getSubmenuLink,
}: CategoryItemProps) {
  const hasSubcats = category.subcategories && category.subcategories.length > 0;

  return (
    <>
      {/* Category Header/Link */}
      {hasSubcats ? (
        <button
          onClick={() => {
            onCategorySelect(category);
            onToggle();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          className={`
            flex items-center justify-between w-full pl-9 pr-5 py-3.5 text-[14px] 
            transition-colors duration-200
            ${isExpanded ? "text-[var(--brand-primary)] font-semibold" : "text-gray-700 hover:text-black"}
          `}
          aria-expanded={isExpanded}
          role="button"
          tabIndex={0}
        >
          <span className="uppercase tracking-wider text-xs">{category.name}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180 text-[var(--brand-primary)]" : "text-gray-400"
            }`}
            aria-hidden="true"
          />
        </button>
      ) : (
        <Link
          href={getSubmenuLink(activeMenu, category)}
          onClick={() => onNavigate("/")}
          className="block pl-9 pr-5 py-3.5 text-[14px] text-gray-700 hover:text-black hover:bg-gray-50 transition-colors uppercase tracking-wider text-xs"
        >
          {category.name}
        </Link>
      )}

      {/* Subcategories (Expanded) */}
      {isExpanded && hasSubcats && (
        <div className="bg-white border-t border-gray-50 pb-3 pt-1">
          {/* View All Category Link */}
          <Link
            href={getSubmenuLink(activeMenu, category)}
            onClick={() => onNavigate("/")}
            className="block pl-12 pr-5 py-2.5 text-[13px] font-semibold text-[var(--brand-primary)] hover:bg-gray-50 transition-colors uppercase tracking-wider"
          >
            View all {category.name}
          </Link>

          {/* Individual Subcategory Links */}
          {category.subcategories.map((subcat) => (
            <Link
              key={subcat.slug}
              href={getSubmenuLink(activeMenu, subcat)}
              onClick={() => onNavigate("/")}
              className="block pl-12 pr-5 py-2.5 text-[14px] text-gray-500 hover:text-black hover:bg-gray-50 transition-colors"
            >
              {subcat.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
});

interface SubmenuItemProps {
  submenu: Submenu;
  isExpanded: boolean;
  expandedCategory: number | string | null;
  onToggle: () => void;
  onCategoryToggle: (categoryId: number | string) => void;
  onCategorySelect: (category: Category) => void;
  onNavigate: (path: string) => void;
  activeMenu: MenuItem;
  getSubmenuLink: (menu: MenuItem, link: any) => string;
}

const SubmenuItem = memo(function SubmenuItem({
  submenu,
  isExpanded,
  expandedCategory,
  onToggle,
  onCategoryToggle,
  onCategorySelect,
  onNavigate,
  activeMenu,
  getSubmenuLink,
}: SubmenuItemProps) {
  const hasCategories = submenu.categories && submenu.categories.length > 0;

  return (
    <div className="border-b border-gray-50">
      {/* Submenu Header/Link */}
      {hasCategories ? (
        <button
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
          className={`
            flex items-center justify-between w-full px-5 py-4 text-[15px] 
            font-medium transition-colors duration-200
            ${
              isExpanded
                ? "bg-gray-50 text-[var(--brand-primary)]"
                : "text-gray-800 hover:bg-gray-50 active:bg-gray-50"
            }
          `}
          aria-expanded={isExpanded}
          role="button"
          tabIndex={0}
        >
          <span className="uppercase tracking-wide">{submenu.name}</span>
          <ChevronDown
            size={18}
            className={`transition-transform duration-300 ${
              isExpanded ? "rotate-180 text-[var(--brand-primary)]" : "text-gray-400"
            }`}
            aria-hidden="true"
          />
        </button>
      ) : (
        <Link
          href={getSubmenuLink(activeMenu, submenu)}
          onClick={() => onNavigate("/")}
          className="flex items-center justify-between w-full px-5 py-4 text-[15px] font-medium text-gray-800 hover:bg-gray-50 transition-colors uppercase tracking-wide"
        >
          {submenu.name}
        </Link>
      )}

      {/* Categories (Expanded) */}
      {isExpanded && hasCategories && (
        <div className="bg-white overflow-hidden">
          {/* Submenu "View All" Link */}
          <Link
            href={getSubmenuLink(activeMenu, submenu)}
            onClick={() => onNavigate("/")}
            className="block pl-9 pr-5 py-3 text-[13px] font-semibold text-[var(--brand-primary)] bg-gray-50/50 hover:bg-gray-100 transition-colors uppercase tracking-wider"
          >
            View all {submenu.name}
          </Link>

          {/* Category Items */}
          {submenu.categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isExpanded={expandedCategory === category.id}
              onToggle={() => onCategoryToggle(category.id)}
              onCategorySelect={onCategorySelect}
              onNavigate={onNavigate}
              activeMenu={activeMenu}
              getSubmenuLink={getSubmenuLink}
            />
          ))}
        </div>
      )}
    </div>
  );
});

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
  // =========================================================================
  // STATE MANAGEMENT
  // =========================================================================
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState<number | string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<number | string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // =========================================================================
  // LIFECYCLE & BODY LOCK
  // =========================================================================
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      // Keep mounted for exit animation
      const timer = setTimeout(() => {
        setIsMounted(false);
        resetMenuState();
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // =========================================================================
  // KEYBOARD SUPPORT
  // =========================================================================
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        activeMenu ? resetMenuState() : onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeMenu, onClose]);

  // =========================================================================
  // STATE UPDATE HANDLERS (Memoized)
  // =========================================================================

  const resetMenuState = useCallback(() => {
    setActiveMenu(null);
    setExpandedSubmenu(null);
    setExpandedCategory(null);
  }, []);

  const goBack = useCallback(() => {
    setExpandedSubmenu(null);
    setExpandedCategory(null);
    setActiveMenu(null);
  }, []);

  const handleMenuSelect = useCallback((menu: MenuItem) => {
    setActiveMenu(menu);
    setExpandedSubmenu(null);
    setExpandedCategory(null);
  }, []);

  const handleSubmenuToggle = useCallback((submenuId: number | string) => {
    setExpandedSubmenu((prev) => (prev === submenuId ? null : submenuId));
    setExpandedCategory(null);
  }, []);

  const handleCategoryToggle = useCallback((categoryId: number | string) => {
    setExpandedCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  const handleNavigate = useCallback(() => {
    onClose();
  }, [onClose]);

  // =========================================================================
  // EARLY RETURNS
  // =========================================================================
  if (!isMounted && !isOpen) return null;

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div
      className={`fixed inset-0 flex lg:hidden z-[100] transition-all duration-300 ${
        isOpen ? "visible opacity-100" : "invisible opacity-0"
      }`}
      role="presentation"
    >
      {/* BACKDROP */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* DRAWER PANEL */}
      <div
        className={`
          relative w-[85%] max-w-[360px] h-full bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-out will-change-transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* DRAWER HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 min-h-[64px] flex-shrink-0">
          {activeMenu ? (
            <button
              onClick={goBack}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goBack();
                }
              }}
              className="flex items-center gap-2 text-[15px] font-medium text-gray-700 hover:text-black transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 rounded-md px-1"
              aria-label="Go back to menu"
            >
              <ArrowLeft size={20} aria-hidden="true" />
              <span>Back</span>
            </button>
          ) : (
            <h2 className="font-bold tracking-widest uppercase text-xl text-black">Menu</h2>
          )}
          <button
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClose();
              }
            }}
            className="p-2 -mr-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2"
            aria-label="Close menu"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* MENU LIST VIEW */}
          {!activeMenu && (
            <MainMenuView
              menus={menus}
              getMenuLink={getMenuLink}
              onMenuSelect={handleMenuSelect}
              onNavigate={handleNavigate}
            />
          )}

          {/* SUBMENU & CATEGORY VIEW */}
          {activeMenu && (
            <SubmenuView
              menu={activeMenu}
              expandedSubmenu={expandedSubmenu}
              expandedCategory={expandedCategory}
              onSubmenuToggle={handleSubmenuToggle}
              onCategoryToggle={handleCategoryToggle}
              onNavigate={handleNavigate}
              getSubmenuLink={getSubmenuLink}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN MENU VIEW
// ============================================================================

interface MainMenuViewProps {
  menus: MenuItem[];
  getMenuLink: (menu: MenuItem) => string;
  onMenuSelect: (menu: MenuItem) => void;
  onNavigate: () => void;
}

const MainMenuView = memo(function MainMenuView({
  menus,
  getMenuLink,
  onMenuSelect,
  onNavigate,
}: MainMenuViewProps) {
  return (
    <nav className="bg-white">
      {/* CATEGORIES SECTION */}
      <div className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-widest">
        Categories
      </div>
      {menus.map((item) => {
        const hasDropdown = item.dropdown?.submenus?.length > 0;

        return (
          <div key={item.id}>
            {!hasDropdown ? (
              // Simple Link (no submenu)
              <Link
                href={getMenuLink(item)}
                onClick={onNavigate}
                className="block px-5 py-3.5 text-[15px] font-medium tracking-wide uppercase text-gray-900 hover:text-[var(--brand-primary)] active:bg-gray-50 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              // Button to enter submenu view
              <button
                onClick={() => onMenuSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onMenuSelect(item);
                  }
                }}
                className="flex justify-between w-full items-center px-5 py-3.5 text-[15px] font-medium tracking-wide uppercase text-gray-900 hover:text-[var(--brand-primary)] active:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-inset"
                aria-label={`Browse ${item.name}`}
              >
                <span>{item.name}</span>
                <ChevronRight size={18} className="text-gray-400" aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}

      {/* SUPPORT SECTION */}
      <div className="mt-6 border-t border-gray-100 pt-4">
        <div className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          Support
        </div>
        <Link
          href="/become-partner"
          onClick={onNavigate}
          className="block px-5 py-3 text-[15px] font-medium tracking-wide uppercase text-gray-900 hover:text-[var(--brand-primary)] active:bg-gray-50 transition-colors"
        >
          Ambassador
        </Link>
      </div>
    </nav>
  );
});

// ============================================================================
// SUBMENU VIEW
// ============================================================================

interface SubmenuViewProps {
  menu: MenuItem;
  expandedSubmenu: number | string | null;
  expandedCategory: number | string | null;
  onSubmenuToggle: (id: number | string) => void;
  onCategoryToggle: (id: number | string) => void;
  onNavigate: () => void;
  getSubmenuLink: (menu: MenuItem, link: any) => string;
}

const SubmenuView = memo(function SubmenuView({
  menu,
  expandedSubmenu,
  expandedCategory,
  onSubmenuToggle,
  onCategoryToggle,
  onNavigate,
  getSubmenuLink,
}: SubmenuViewProps) {
  return (
    <nav className="bg-white flex flex-col">
      {/* SUBMENU HEADER */}
      <div className="px-5 py-4 bg-gray-50/80 border-b border-gray-100 flex-shrink-0">
        <h3 className="text-[17px] font-bold tracking-wide uppercase text-gray-900">{menu.name}</h3>
      </div>

      {/* SUBMENU ITEMS */}
      <div className="flex-1 overflow-y-auto">
        {menu.dropdown?.submenus?.map((submenu) => (
          <SubmenuItem
            key={submenu.id}
            submenu={submenu}
            isExpanded={expandedSubmenu === submenu.id}
            expandedCategory={expandedCategory}
            onToggle={() => onSubmenuToggle(submenu.id)}
            onCategoryToggle={onCategoryToggle}
            onCategorySelect={() => {}} // Not used in submenu view
            onNavigate={onNavigate}
            activeMenu={menu}
            getSubmenuLink={getSubmenuLink}
          />
        ))}
      </div>
    </nav>
  );
});