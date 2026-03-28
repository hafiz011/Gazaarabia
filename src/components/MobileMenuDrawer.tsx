"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ArrowLeft, ChevronRight } from "lucide-react";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menus: any[];
  getMenuLink: (menu: any) => string;
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  menus,
  getMenuLink,
}: MobileMenuDrawerProps) {
  const [activeMenu, setActiveMenu] = useState<any | null>(null);


  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);


  if (!isOpen) return null;

  const goBack = () => setActiveMenu(null);

  const hasDropdown = (item: any) =>
    item?.dropdown &&
    ((item.dropdown.left?.length ?? 0) > 0 ||
      (item.dropdown.right?.length ?? 0) > 0);

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* DRAWER */}
      <div className="relative w-[80%] max-w-[320px] h-screen bg-white shadow-xl animate-slideIn flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {activeMenu ? (
            <button onClick={goBack} className="flex items-center gap-2 text-sm">
              <ArrowLeft size={18} />
              Back
            </button>
          ) : (
            <button onClick={onClose} className="p-2">
              <X size={24} />
            </button>
          )}
        </div>

        {/* COUNTRY (ONLY MAIN VIEW) */}
        {!activeMenu && (
          <div className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">
            United Kingdom
          </div>
        )}

        {/* MAIN VIEW */}
        {!activeMenu && (
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 uppercase font-semibold text-[14px] tracking-wide text-[var(--text-primary)]">


            {menus.map((item) => {
              const hasDropdown =
                item?.dropdown?.submenus?.length > 0;

              return (
                <div
                  key={item.id}
                  className="py-3 border-b border-gray-100 flex justify-between items-center"
                >
                  {/* NO DROPDOWN → normal link */}
                  {!hasDropdown && (
                    <Link href={getMenuLink(item)} onClick={onClose}>
                      {item.name}
                    </Link>
                  )}

                  {/* HAS DROPDOWN → button + icon */}
                  {hasDropdown && (
                    <button
                      onClick={() => setActiveMenu(item)}
                      className="flex justify-between w-full items-center"
                    >
                      <span>{item.name}</span>
                      <ChevronRight size={18} className="text-gray-500" />
                    </button>
                  )}
                </div>
              );
            })}


            {/* -------------------------------- */}
            {/* STATIC ITEMS: PARTNER + CONTACT  */}
            {/* -------------------------------- */}

            {/* Partner */}
            <div className="py-3 border-b border-gray-100">
              <Link href="/become-partner" onClick={onClose}>
                Partner
              </Link>
            </div>

            {/* Contact Us */}
            {/* <div className="py-3 border-b border-gray-100">
              <Link href="/contact" onClick={onClose}>
                Contact Us
              </Link>
            </div> */}

          </nav>
        )}

      
        {/* SUBMENU VIEW */}
        {activeMenu && (
          <nav className="flex-1 overflow-y-auto bg-white">

            {/* HEADER */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">

              <div className="text-[18px] font-semibold text-[var(--text-primary)]">
                {activeMenu.name}
              </div>

            </div>


            {/* SUBMENU SECTIONS */}
            <div className="divide-y divide-gray-100">

              {activeMenu.dropdown?.submenus?.map((submenu: any) => (
                <div key={submenu.id}>

                  {/* SUBMENU TITLE */}
                  <div className="px-4 pt-4 pb-2 text-[12px] uppercase tracking-widest text-gray-400">
                    {submenu.name}
                  </div>


                  {/* SUBCATEGORY LINKS */}
                  <div>

                    {submenu.subcategories?.map((subcat: any) => (
                      <Link
                        key={subcat.slug}
                        href={`/shop/${subcat.slug}`}
                        onClick={onClose}
                        className="
                  flex items-center justify-between
                  px-4 py-3
                  text-[15px]
                  text-gray-800
                  hover:bg-gray-50
                  active:bg-gray-100
                  transition
                "
                      >

                        <span className="leading-tight">
                          {subcat.name}
                        </span>

                        <ChevronRight
                          size={18}
                          className="text-gray-400"
                        />

                      </Link>
                    ))}

                  </div>

                </div>
              ))}

            </div>

          </nav>
        )}

        {/* FOOTER */}
        {!activeMenu && (
          <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500">
            &copy;  {new Date().getFullYear()} Gazaarabia
          </div>
        )}
      </div>
    </div>
  );
}