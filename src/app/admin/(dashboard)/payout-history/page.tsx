"use client";

import { useState, useEffect } from "react";
import {
    History,
    Search,
    ArrowLeft,
    Download,
    CheckCircle2,
    FileText,
    Calendar,
    ArrowUpRight
} from "lucide-react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";

interface PayoutHistoryItem {
    id: number;
    amount: number;
    paymentMethod: string;
    paymentRef: string;
    paidAt: string;
    periodLabel: string;
    seller: {
        shopName: string;
        user: { name: string; email: string }
    };
}

export default function AdminPayoutHistoryPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState<PayoutHistoryItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.token) return;
            try {
                setLoading(true);
                const res = await fetch("/api/admin/payout-history", {
                    headers: { Authorization: `Bearer ${session.user.token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setHistory(data.data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    const filteredHistory = history.filter(h =>
        h.seller.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.paymentRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.periodLabel?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && history.length === 0) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header Section */}
            <div className="bg-[#1E2A4A] text-white p-8 rounded-b-[2rem] shadow-lg mb-8">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Payout Management
                    </button>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                <History size={32} className="text-blue-400" />
                                Payout History
                            </h1>
                            <p className="text-blue-200 text-lg">Detailed audit trail of all distributions made to sellers.</p>
                        </div>
                        <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/10 shadow-inner">
                            <p className="text-xs text-blue-200 uppercase tracking-widest font-bold mb-1">Total Payouts</p>
                            <h3 className="text-2xl font-black">{history.length} Transactions</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Search & Filter Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by shop, reference, or date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium text-sm">
                        <Download size={18} />
                        Export Audit Trail (CSV)
                    </button>
                </div>

                {/* History Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Seller / Shop</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference Info</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount Paid</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredHistory.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                    <Calendar size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{new Date(item.paidAt).toLocaleDateString()}</p>
                                                    <p className="text-[10px] text-gray-400 uppercase font-black uppercase tracking-tighter">
                                                        {new Date(item.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold border border-gray-200">
                                                    {item.seller.shopName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer flex items-center gap-1">
                                                        {item.seller.shopName}
                                                        <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </p>
                                                    <p className="text-xs text-gray-500">{item.seller.user.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-gray-100 text-gray-700 w-fit">
                                                    {item.paymentMethod}
                                                </span>
                                                <p className="text-xs text-gray-400 font-mono">{item.paymentRef || "No reference provided"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-lg font-black text-green-600">
                                                ${item.amount.toLocaleString()}
                                            </p>
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Paid in full</span>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100 rounded-lg bg-transparent hover:bg-blue-50/50 group/btn">
                                                <FileText size={20} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center text-gray-400 italic font-medium">
                                            No payout records found. Record a payout to start building history.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
