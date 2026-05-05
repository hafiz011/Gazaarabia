"use client"
import StoreConnect from "@/components/seller/StoreConnect";
import { LayoutGrid, Info } from "lucide-react";

export default function IntegrationsPage() {
    const user = {
        id: 1
    }

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                        <LayoutGrid size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Apps & Integrations</h1>
                        <p className="text-gray-500 mt-1">Connect your external stores to synchronize products and manage everything in one place.</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-xl border border-amber-100 text-sm">
                    <Info size={18} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">Important Note:</p>
                        <p className="mt-0.5 opacity-90">Synchronizing products will automatically import descriptions, prices, and stock levels from your external store. Ensure your credentials are correct before proceeding.</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex justify-center">
                <StoreConnect sellerId={user.id} />
            </div>
        </div>
    );
}