"use client"

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StoreConnect from "@/components/seller/StoreConnect";
import { LayoutGrid, Info, ShieldCheck } from "lucide-react";
import SellerLoader from "@/components/seller/SellerLoader";
import { ROUTES } from "@/constants/routes";

export default function IntegrationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [sellerId, setSellerId] = useState<number | null>(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace(ROUTES.SELLER.LOGIN);
        }
    }, [status, router]);

    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            // In this app, we might need to fetch the seller record to get the seller.id
            // Or if it's already in the session, we use it.
            // Based on other pages, it seems we might need to fetch it or it's hardcoded for now.
            // Let's try to get it from the session if available, otherwise fetch.

            const fetchSeller = async () => {
                try {
                    const res = await fetch('/api/seller/profile', {
                        headers: { 'Authorization': `Bearer ${session.user.token}` }
                    });
                    const data = await res.json();
                    if (data.seller?.id) setSellerId(data.seller.id);
                } catch (err) {
                    console.error("Failed to fetch seller profile:", err);
                }
            };

            if (session.user.token) {
                fetchSeller();
            }
        }
    }, [status, session]);

    if (status !== "authenticated" || !sellerId || !session) {
        return <SellerLoader />;
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn pb-20">
            {/* Premium Header Section */}
            <div className="relative bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <LayoutGrid size={160} />
                </div>

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                        <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200">
                            <LayoutGrid size={40} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Apps & Integrations</h1>
                            <p className="text-gray-500 mt-2 text-lg font-medium">Power up your store by connecting with global e-commerce platforms.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4 p-6 bg-blue-50/50 text-blue-800 rounded-3xl border border-blue-100/50">
                            <div className="p-2 bg-blue-100 rounded-xl">
                                <Info size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Automated Sync</p>
                                <p className="mt-1 text-xs opacity-80 leading-relaxed font-medium">Synchronizing products will automatically import descriptions, prices, and stock levels from your external store.</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-emerald-50/50 text-emerald-800 rounded-3xl border border-emerald-100/50">
                            <div className="p-2 bg-emerald-100 rounded-xl">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Secure Connection</p>
                                <p className="mt-1 text-xs opacity-80 leading-relaxed font-medium">Your credentials are encrypted and stored securely. We only use them to sync your product catalog.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-col items-center">
                <StoreConnect sellerId={sellerId!} token={session.user.token} />
            </div>
        </div>
    );
}
