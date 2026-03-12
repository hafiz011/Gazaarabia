"use client";

import { useState, useEffect } from "react";
import AdminHeader from "../admin/AdminHeader";
import AdminSidebar from "../admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  //  Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [sidebarOpen, isMobile]);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true)
    }
  }, [isMobile])

  return (
    <div className="flex min-h-screen bg-[#f5f6fa] relative">
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        collapsed={collapsed}
        setCollapsed={(val) => {
          console.log("setCollapsed:", val);
          setCollapsed(val);
        }}
      />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 min-h-screen relative z-10 transition-all duration-300 ease-in-out`}
        style={{
          //  Shifts content when sidebar expands/collapses
          marginLeft: sidebarOpen && collapsed ? "80px" : (!sidebarOpen && !collapsed ? "256px" : (!isMobile && !sidebarOpen && collapsed ? "80px" : !isMobile ? "256px" : "")),
        }}
      >

        {/* Header */}
        <AdminHeader onMenuToggle={() => {
          console.log('sidebarOpen:>', !sidebarOpen);
          setSidebarOpen(!sidebarOpen)
          console.log("isMobile:>", isMobile)
        }} />

        {/* Main Area */}
        <main className="flex-1 p-6 bg-[#f5f6fa] overflow-y-auto">
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
