"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    ShoppingCart,
    ClipboardList,
    Tag,
    Settings,
    MessageSquare,
    LogOut,
    ChevronLeft,
    ChevronRight,
    TicketPercent,
    UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import PopupAlert from "../PopupAlert";
import { ROUTES } from "@/constants/routes";

const affiliateLinks = [
    { href: "/affiliate", label: "Dashboard", icon: LayoutDashboard },
    { href: "/affiliate/profile", label: "Profile", icon: UserCircle },
    { href: "/affiliate/coupons", label: "coupons", icon: TicketPercent },
    { href: "/affiliate/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/affiliate/earnings", label: "Earnings", icon: Tag },
    // { href: "/affiliate/payouts", label: "Payouts", icon: ClipboardList },
    // { href: "/affiliate/settings", label: "Settings", icon: Settings },
    // { href: "/affiliate/support", label: "Support", icon: MessageSquare },
];

export default function AffiliateSidebar({
    isOpen,
    collapsed,
    setCollapsed,
}: {
    isOpen: boolean;
    collapsed: boolean;
    setCollapsed: (val: boolean) => void;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [confirmLogout, setConfirmLogout] = useState(false);

    //  Role-based access control
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.replace(ROUTES.AFFILIATE.LOGIN);
            return;
        }
        if (session?.user?.role !== "affiliate") {
            router.replace(ROUTES.HOME);
        }
    }, [status, session, router]);

    const handleLogout = async () => {
        await signOut({ callbackUrl: ROUTES.AFFILIATE.LOGIN });
    };

    return (
        <>
            <aside
                className={`fixed z-[9999] top-0 left-0 h-screen transform transition-all duration-300 ease-in-out flex flex-col
        ${collapsed ? "w-[80px]" : "w-64"} 
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
                style={{
                    background:
                        "linear-gradient(180deg, rgba(43,56,99,0.95) 0%, rgba(43,56,99,0.88) 100%)",
                    backdropFilter: "blur(10px)",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                {/*  Logo Section */}
                <div
                    className={`p-6 border-b border-[rgba(255,255,255,0.1)] flex items-center ${collapsed ? "justify-center" : "justify-between"
                        } gap-2`}
                >
                    {!collapsed && (
                        <h2 className="text-lg font-semibold tracking-wide text-white">
                            Gaza Arabia{" "}
                            {/* <span className="text-[var(--brand-primary)]">Affiliate</span> */}
                        </h2>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="text-gray-300 hover:text-white transition"
                        title={collapsed ? "Expand" : "Collapse"}
                    >
                        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/*  Navigation */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <nav className="flex-1 overflow-y-auto px-3 mt-5 pb-10 relative z-30">
                        {affiliateLinks.map(({ href, label, icon: Icon }, index) => {
                            const isActive = pathname === href;
                            const isLast = index === affiliateLinks.length - 1;

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`group flex items-center gap-3 px-4 py-[12px] rounded-xl text-sm font-medium transition-all duration-200 relative
                    ${isActive
                                            ? "bg-[var(--brand-primary)] text-white shadow-[0_4px_12px_rgba(232,44,63,0.4)] scale-[1.02]"
                                            : "text-[var(--soft-gray)] hover:bg-[var(--brand-secondary)] hover:text-white hover:scale-[1.02]"
                                        }`}
                                    style={{
                                        marginTop: "8px",
                                        marginBottom: isLast ? "20px" : "8px",
                                        justifyContent: collapsed ? "center" : "flex-start",
                                        transition: "all 0.25s ease",
                                    }}
                                >
                                    <Icon size={20} className="shrink-0" />
                                    {!collapsed && <span className="truncate">{label}</span>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/*  Footer */}
                    <div className="border-t border-[rgba(255,255,255,0.1)] bg-[rgba(43,56,99,0.98)] relative z-10">
                        <button
                            onClick={() => setConfirmLogout(true)}
                            className={`w-full flex items-center justify-between px-4 py-3 
                 text-white text-sm 
                 hover:bg-[var(--brand-primary)] 
                 transition-colors
                 ${collapsed ? "justify-center" : ""}`}
                        >
                            {collapsed ? (
                                <LogOut size={18} />
                            ) : (
                                <>
                                    <span>© {new Date().getFullYear()} Gaza Arabia</span>
                                    <div className="flex items-center gap-2">
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/*  Logout Confirmation Popup */}
            {confirmLogout && (
                <PopupAlert
                    type="warning"
                    message="Are you sure you want to sign out?"
                    confirmText="Yes, Sign Out"
                    cancelText="Cancel"
                    onConfirm={handleLogout}
                    onCancel={() => setConfirmLogout(false)}
                    show={confirmLogout}
                />
            )}
        </>
    );
}
