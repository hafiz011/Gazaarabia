"use client";

import { useState, useEffect } from "react";
import { 
    BadgeDollarSign, 
    Clock, 
    CheckCircle2, 
    Wallet, 
    Info, 
    ArrowUpRight, 
    Calendar,
    ChevronRight,
    Search,
    Filter
} from "lucide-react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";

interface EarningItem {
    id: number;
    subtotal: number;
    sellerEarning: number;
    createdAt: string;
    payoutEligibleAt: string;
    isPayoutEligible: boolean;
    isPaidOut: boolean;
    product: { title: string };
}

interface PayoutHistory {
    id: number;
    amount: number;
    paymentMethod: string;
    paymentRef: string;
    paidAt: string;
    status: string;
}

interface SellerPayoutData {
    balances: {
        pending: number;
        available: number;
        totalPaid: number;
        minimumPayout: number;
    };
    recentEarnings: EarningItem[];
    payoutHistory: PayoutHistory[];
}

export default function SellerPayoutsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SellerPayoutData | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!session?.user?.token) return;
            try {
                setLoading(true);
                const res = await fetch("/api/seller/payouts", {
                    headers: { Authorization: `Bearer ${session.user.token}` }
                });
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [session]);

    if (loading && !data) return <Loader />;
    if (!data) return <div className="p-8 text-center text-gray-500 font-medium whitespace-nowrap">No payout data available.</div>;

    const progressPercent = Math.min((data.balances.available / data.balances.minimumPayout) * 100, 100);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Earnings & Payouts</h1>
                        <p className="text-gray-500 mt-1">Track your income, pending balances, and distribution history.</p>
                    </div>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Pending Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-orange-100 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                                <Clock size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Pending Balance</p>
                            <h3 className="text-4xl font-black text-gray-900 mt-2">${data.balances.pending.toLocaleString()}</h3>
                            <div className="flex items-center gap-1.5 mt-4 text-xs text-orange-600 bg-orange-50 w-fit px-2 py-1 rounded-full font-bold">
                                <Info size={12} />
                                Subject to 30-day cooling
                            </div>
                        </div>
                    </div>

                    {/* Available Card */}
                    <div className="bg-[#1E2A4A] rounded-[2rem] p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden group text-white hover:scale-[1.02] transition-all">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-400/20 transition-all duration-700"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-white/10 text-blue-300 rounded-2xl flex items-center justify-center mb-6 border border-white/10">
                                <Wallet size={24} />
                            </div>
                            <p className="text-sm font-semibold text-blue-300 uppercase tracking-wider">Available for Payout</p>
                            <h3 className="text-4xl font-black text-white mt-2">${data.balances.available.toLocaleString()}</h3>
                            
                            <div className="mt-6 space-y-2">
                                <div className="flex justify-between text-xs font-bold text-blue-200">
                                    <span>Goal: ${data.balances.minimumPayout}</span>
                                    <span>{progressPercent.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                                        style={{ width: `${progressPercent}%` }}
                                    ></div>
                                </div>
                                {data.balances.available >= data.balances.minimumPayout && (
                                    <p className="text-[10px] text-green-300 font-bold flex items-center gap-1 mt-1">
                                        <CheckCircle2 size={10} /> Threshold reached! Processing soon.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Total Paid Card */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-blue-50 relative overflow-hidden group hover:shadow-md transition-all">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                <BadgeDollarSign size={24} />
                            </div>
                            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Received</p>
                            <h3 className="text-4xl font-black text-gray-900 mt-2">${data.balances.totalPaid.toLocaleString()}</h3>
                            <button className="flex items-center gap-2 text-xs text-blue-600 font-bold mt-6 hover:text-blue-700 transition-colors">
                                View Payout Certificates <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Earnings Table */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Recent Earnings</h2>
                            <button className="text-sm font-bold text-blue-600 hover:text-blue-700">See All Orders</button>
                        </div>
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#1E2A4A] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Order Info</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-center">Your Earning</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Eligibility Date</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data.recentEarnings.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-sm">{item.product.title}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Order #{item.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="font-black text-gray-900">${item.sellerEarning.toLocaleString()}</span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                        <Calendar size={14} />
                                                        {new Date(item.payoutEligibleAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    {item.isPaidOut ? (
                                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase rounded-lg">Settled</span>
                                                    ) : item.isPayoutEligible ? (
                                                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded-lg">Available</span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-black uppercase rounded-lg">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {data.recentEarnings.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="py-12 text-center text-gray-400 italic font-medium">No recent earnings found. Start selling to see data here!</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Payout History Side Panel */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
                        </div>
                        <div className="space-y-4">
                            {data.payoutHistory.map((payout) => (
                                <div key={payout.id} className="bg-white p-5 rounded-2x border border-gray-100 shadow-sm group hover:border-blue-200 transition-all flex justify-between items-center rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-bold">
                                            $
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">${payout.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(payout.paidAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 mb-1">{payout.paymentMethod}</p>
                                        <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{payout.paymentRef || "No Ref"}</span>
                                    </div>
                                </div>
                            ))}
                            {data.payoutHistory.length === 0 && (
                                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl py-12 text-center text-gray-400 text-sm font-medium">
                                    No distributions recorded yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
