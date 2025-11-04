"use client";

import { Menu, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModalStore } from "@/lib/stores/modalStore";

export default function AffiliateHeader({ onMenuToggle }: { onMenuToggle: () => void }) {
    const pathname = usePathname();
    const openModal = useModalStore((state) => state.openModal);

    //  Page Titles and Actions for Affiliate Pages
    const titles: Record<
        string,
        { title: string; subtitle?: string; action?: { label: string; href?: string; modalKey?: string } }
    > = {
        "/affiliate": {
            title: "Affiliate Dashboard",
            subtitle: "Overview of your affiliate performance and commissions."
        },
        "/affiliate/coupons": {
            title: "Coupons",
            subtitle: "Track and manage your affiliate coupons.",
            action: { label: "Add Coupon", href: "/affiliate/coupons/form" },
        } ,
        "/affiliate/orders": {
            title: "Orders",
            subtitle: "Track the orders generated through your affiliate coupons.",
        },
        "/affiliate/earnings": {
            title: "Earnings",
            subtitle: "View your earnings and commission breakdown.",
        },
        "/affiliate/payouts": {
            title: "Payouts",
            subtitle: "Track your payout history and payment requests.",
            action: { label: "Request Payout", modalKey: "payout-request" },
        },
        "/affiliate/settings": {
            title: "Settings",
            subtitle: "Manage your affiliate profile and payment details.",
        },
        "/affiliate/support": {
            title: "Support",
            subtitle: "Need help? Reach out to the admin support team.",
        },
    };

    //  Determine current page info
    const current =
        titles[pathname] || {
            title: "Affiliate Panel",
            subtitle: "Manage your affiliate dashboard.",
        };

    //  Handle global modal triggers (for payout requests, etc.)
    const handleActionClick = () => {
        if (current.action?.modalKey) {
            openModal(current.action.modalKey);
        }
    };

    return (
        <header
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 px-6 py-4 sticky top-0 z-50 backdrop-blur-md"
            style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderBottom: "1px solid var(--soft-gray)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
        >
            {/* Left Section — Page title and sidebar toggle */}
            <div className="flex items-start sm:items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="md:hidden p-2 rounded-lg hover:bg-[var(--soft-gray)] transition"
                    aria-label="Toggle Sidebar"
                >
                    <Menu size={22} />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
                        {current.title}
                    </h1>
                    {current.subtitle && (
                        <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-tight">
                            {current.subtitle}
                        </p>
                    )}
                </div>
            </div>

            {/* Right Section — Action Button */}
            {current.action && (
                current.action.href ? (
                    <Link
                        href={current.action.href}
                        className="flex items-center gap-2 bg-[var(--brand-primary)] text-white text-sm font-medium px-4 py-2 rounded-md shadow-md hover:bg-[var(--brand-secondary)] transition"
                    >
                        <Plus size={18} />
                        {current.action.label}
                    </Link>
                ) : (
                    <button
                        onClick={handleActionClick}
                        className="flex items-center gap-2 bg-[var(--brand-primary)] text-white text-sm font-medium px-4 py-2 rounded-md shadow-md hover:bg-[var(--brand-secondary)] transition"
                    >
                        <Plus size={18} />
                        {current.action.label}
                    </button>
                )
            )}
        </header>
    );
}
