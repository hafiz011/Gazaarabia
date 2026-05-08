"use client";

import { useState, useEffect } from "react";
import SellerHeader from "../seller/SellerHeader";
import SellerSidebar from "../seller/SellerSidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  //  Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] relative">
      {/* Sidebar */}
      <SellerSidebar
        isOpen={sidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 w-full min-w-0 min-h-screen relative z-10 transition-all duration-300 ease-in-out ${
          collapsed ? "md:ml-[80px]" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <SellerHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Area */}
        <main className="flex-1 w-full min-w-0 p-2 sm:p-3 bg-[#f5f6fa] overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Overlay (for mobile drawer effect) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
