"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AffiliateSidebar from "./AffiliateSidebar";
import AffiliateHeader from "./AffiliateHeader";

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [collapsed, setCollapsed] = useState(false);

    // Route guard: only affiliates/ambassadors (role === "affiliate") may view the
    // dashboard. Defence-in-depth for the UI — the APIs still authorize each request.
    const isAllowed = (session?.user as any)?.role === "affiliate";

    useEffect(() => {
        if (status === "loading") return;
        if (!session || !isAllowed) {
            router.replace("/affiliate/login");
        }
    }, [status, session, isAllowed, router]);

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

    // While the session resolves, or if the user isn't authorized, don't render
    // the dashboard chrome (the effect above handles the redirect).
    if (status === "loading" || !session || !isAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center text-[var(--text-muted)]">
                Checking access…
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f5f6fa] relative">
            {/*  Sidebar */}
            <AffiliateSidebar
                isOpen={sidebarOpen}
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            {/* Main Content Area */}
            <div
                className={`flex flex-col flex-1 min-h-screen relative z-10 transition-all duration-300 ease-in-out`}
                style={{
                    //  Shifts content when sidebar expands/collapses
                    // marginLeft: collapsed ? "80px" : "256px",
                    marginLeft: sidebarOpen && collapsed ? "80px" : (!sidebarOpen && !collapsed ? "256px" : (!isMobile && !sidebarOpen && collapsed ? "80px" : !isMobile ? "256px" : "")),

                }}
            >
                {/*  Header (reuse admin or create affiliate-specific one) */}
                <AffiliateHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

                {/*  Main Page Content */}
                <main className="flex-1 p-6 bg-[#f5f6fa] overflow-y-auto">{children}</main>
            </div>

            {/* Overlay (for mobile sidebar) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[9998] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
