"use client";

import Link from "next/link";
import { X, Search } from "lucide-react";

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  menus: any[]; // or MenuItem[]
  getMenuLink: (menu: any) => string;
}

export default function MobileMenuDrawer({
  isOpen,
  onClose,
  menus,
  getMenuLink,
}: MobileMenuDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Side Drawer */}
      <div className="relative w-[80%] max-w-[320px] h-[100vh] bg-white shadow-xl animate-slideIn flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 shrink-0">
          <button onClick={onClose} className="p-2">
            <X size={24} />
          </button>
          {/* <Search size={22} className="ml-auto" /> */}
        </div>

        <div className="px-4 py-3 border-b border-gray-200 text-sm flex items-center gap-2 shrink-0">
          <span>United Kingdom</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 uppercase font-medium text-[var(--text-primary)] text-[14px] tracking-wide">
          {menus.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center py-3 border-b border-gray-100"
            >
              <Link href={getMenuLink(item)} onClick={onClose}>
                {item.name}
              </Link>
            </div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-200 text-sm text-gray-500 shrink-0">
          © 2025 Gaza Arabia
        </div>
      </div>
    </div>
  );
}
