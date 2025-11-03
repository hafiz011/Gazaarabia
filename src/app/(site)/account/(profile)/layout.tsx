"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LogOut,
  Package,
  Heart,
  Gift
} from "lucide-react";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import Loader from "@/components/Loader";
import { ROUTES } from "@/constants/routes";

const menuItems = [
  { key: "orders", label: "Orders", path: "/account/orders", icon: <Package size={18} /> },
  { key: "details", label: "My Details", path: "/account/details", icon: <User size={18} /> },
  { key: "rewards", label: "Rewards", path: "/account/rewards", icon: <Gift size={18} /> },
  // { key: "wishlist", label: "Wishlist", path: "/account/wishlist", icon: <Heart size={18} /> },
  { key: "signout", label: "Sign Out", path: "", icon: <LogOut size={18} /> },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [confirmLogout, setConfirmLogout] = useState(false);

  //  Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.USER.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "customer") router.replace(ROUTES.HOME);
  }, [status, session, router]);

  // 🚪 Handle logout after confirmation
  const handleLogout = async () => {
    setConfirmLogout(false);
    await signOut({ callbackUrl: ROUTES.USER.LOGIN });
  };

  return (
    <>
      {(status === "loading") && <Loader />}

      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pt-20 pb-16 px-4 md:px-16 lg:px-24">
        {alert.isOpen && alert.type && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
          />
        )}

        <div className="max-w-6xl mx-auto mb-12">
          <h1 className="text-3xl font-bold tracking-wide mb-2">My Account</h1>
          <p className="text-[var(--text-muted)] text-base">
            Manage your personal information, orders, and addresses
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* 🧭 Sidebar Navigation */}
          <aside className="md:col-span-1 border-r border-[var(--soft-gray)] pr-4 sticky top-24 self-start h-fit">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === "signout") setConfirmLogout(true);
                    else router.push(item.path);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium transition text-left ${pathname === item.path
                      ? "bg-[var(--brand-primary)] text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:bg-[var(--soft-gray)]"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* 🧭 Dynamic Page Content */}
          <main className="md:col-span-3 space-y-8">
            {children}
          </main>
        </div>
      </div>

      {/* 🚪 Logout confirmation */}
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
