"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    TrendingUp,
    Clock,
    ArrowUpRight,
    Download,
    Filter,
    Calendar,
    ChevronRight,
    Wallet,
    CreditCard
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { earningService } from "@/lib/services/seller/earningService";
import Loader from "@/components/Loader";
import { ROUTES } from "@/constants/routes";

interface EarningItem {
    id: number;
    orderId: string;
    productTitle: string;
    amount: number;
    createdAt: string;
}

interface ChartData {
    date: string;
    amount: number;
}

export default function EarningPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<{
        balances: { available: number; pending: number; totalEarned: number };
        recentEarnings: EarningItem[];
        chartData: ChartData[];
    } | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.SELLER.LOGIN);
        else if (session?.user?.token) {
            (async () => {
                try {
                    setLoading(true);
                    const res = await earningService.getEarnings(session.user.token);
                    setData(res);
                } catch (err) {
                    console.error("Failed to fetch earnings", err);
                } finally {
                    setLoading(false);
                }
            })();
        }
    }, [status, session, router]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
        }).format(amount);
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">Store Earnings</h1>
                    <p className="text-gray-500 font-medium mt-1">Track your revenue and manage your payouts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={16} />
                        Export Data
                    </button>
                    <button className="flex items-center gap-2 bg-[var(--brand-primary)] px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:opacity-90 transition-all">
                        <CreditCard size={16} />
                        Request Payout
                    </button>
                </div>
            </div>

            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Available Balance", value: data?.balances.available || 0, icon: Wallet, color: "blue", desc: "Ready for payout" },
                    { label: "Pending Balance", value: data?.balances.pending || 0, icon: Clock, color: "amber", desc: "In verification" },
                    { label: "Total Earned", value: data?.balances.totalEarned || 0, icon: TrendingUp, color: "emerald", desc: "Lifetime earnings" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 -mr-12 -mt-12 bg-${stat.color}-500/5 rounded-full group-hover:scale-125 transition-transform duration-700`} />
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black text-gray-900 mt-2">{formatCurrency(stat.value)}</h3>
                            <p className="text-xs font-medium text-gray-400 mt-2 flex items-center gap-1">
                                {stat.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                        <p className="text-sm text-gray-400 font-medium">Daily performance for the last 30 days</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white text-[var(--brand-primary)] shadow-sm">30D</button>
                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600">90D</button>
                        <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-gray-400 hover:text-gray-600">1Y</button>
                    </div>
                </div>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.chartData || []}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                                tickFormatter={(str) => {
                                    const date = new Date(str);
                                    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                                tickFormatter={(val) => `£${val}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                    padding: '12px'
                                }}
                                formatter={(val: any) => [formatCurrency(val), 'Earnings']}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="var(--brand-primary)"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                    <button className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
                        View All <ChevronRight size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Order & Product</th>
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Date</th>
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                <th className="py-5 px-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {data?.recentEarnings.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">#{item.orderId}</span>
                                            <span className="text-xs text-gray-400 font-medium truncate max-w-[250px]">{item.productTitle}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-sm text-gray-500 font-medium">
                                        {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-5 px-8">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-tighter">
                                            <ArrowUpRight size={10} />
                                            Completed
                                        </span>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <span className="text-sm font-black text-gray-900">{formatCurrency(item.amount)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}