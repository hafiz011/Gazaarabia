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

  //  Handle logout after confirmation
  const handleLogout = async () => {
    setConfirmLogout(false);
    await signOut({ callbackUrl: ROUTES.USER.LOGIN });
  };

  return (
    <>
      {(status === "loading") && <Loader />}

      <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] pt-24 pb-10 px-4 md:px-16 lg:px-24">

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10">

          {/* SIDEBAR */}
          <aside
            className="
        w-full md:w-64 
        border-r md:border-[var(--soft-gray)] 
        bg-white 
        md:sticky md:top-24 
        md:h-[calc(100vh-96px)] 
        md:overflow-y-auto 
        p-4 rounded-lg md:rounded-none
      "
          >
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

          {/* MAIN CONTENT */}
          <main
            className="
        flex-1 
        md:h-[calc(100vh-96px)] 
        md:overflow-y-auto 
        space-y-8 pr-1
      "
          >
            {/* Page heading */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-wide">My Account</h1>
              <p className="text-[var(--text-muted)] text-base">
                Manage your personal information, orders, and addresses
              </p>
            </div>

            {children}
          </main>
        </div>
      </div>


      {/*  Logout confirmation */}
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
