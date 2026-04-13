"use client";

import { useState, useEffect, useCallback } from "react";
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    Users,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Download,
    Filter,
    Activity,
    PieChart as PieChartIcon,
    BarChart3,
    RefreshCw,
    ChevronRight,
    Package,
    Award,
    Heart
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from "recharts";
import moment from "moment";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const PIE_COLORS = ["#E82C3F", "#009639", "#3b82f6"];

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-gray-100/50">
                <p className="text-xs font-semibold text-gray-400 mb-2">
                    {moment(label).format("MMM DD, YYYY")}
                </p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mt-1">
                        <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs font-medium text-gray-500 capitalize">{entry.dataKey}:</span>
                        <span className="text-sm font-bold text-gray-900">
                            ${Number(entry.value).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

// Custom bar chart tooltip
const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl shadow-2xl border border-gray-100/50">
                <p className="text-sm font-bold text-gray-900 mb-1">{payload[0]?.payload?.name}</p>
                <p className="text-xs font-semibold text-[var(--brand-primary)]">
                    ${Number(payload[0]?.value).toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};


export default function PlatformRevenueAnalysis() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD')
    });
    const [refreshing, setRefreshing] = useState(false);

    const token = session?.user?.token;

    const fetchAnalysis = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            setRefreshing(true);
            const query = new URLSearchParams(dateRange).toString();
            const response = await fetch(`/api/revenue-breakdown?${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const res = await response.json();
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Error fetching analysis:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token, dateRange]);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (status === "authenticated" && session?.user?.role?.toLowerCase() !== "admin") {
            router.replace(ROUTES.HOME);
        } else if (status === "authenticated") {
            fetchAnalysis();
        }
    }, [status, session, router, fetchAnalysis]);

    if (status === "loading" || (loading && !data)) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader /></div>;
    }

    const { kpis, revenueTrend, sellerBreakdown, categoryBreakdown } = data || {};

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const formatCompact = (val: number) => {
        if (!val) return "$0";
        if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
        return `$${val.toFixed(0)}`;
    };

    const pieData = [
        { name: "Seller Earnings", value: kpis?.totalSellerEarning || 0 },
        { name: "Platform Profit", value: kpis?.totalProfit || 0 },
        { name: "Ambassador/Affiliate", value: (kpis?.totalAmbassadorEarning || 0) + (kpis?.totalAffiliateEarning || 0) },
    ];

    const totalPieValue = pieData.reduce((acc, item) => acc + item.value, 0);

    const metricCards = [
        {
            label: "Gross Revenue",
            value: formatCurrency(kpis?.totalRevenue),
            icon: DollarSign,
            gradient: "from-[#E82C3F] to-[#ff6b6b]",
            bgLight: "bg-red-50",
            textColor: "text-[#E82C3F]",
            iconBg: "bg-gradient-to-br from-[#E82C3F] to-[#ff6b6b]",
        },
        {
            label: "Platform Profit",
            value: formatCurrency(kpis?.totalProfit),
            icon: TrendingUp,
            gradient: "from-[#009639] to-[#00c853]",
            bgLight: "bg-emerald-50",
            textColor: "text-[#009639]",
            iconBg: "bg-gradient-to-br from-[#009639] to-[#00c853]",
        },
        {
            label: "Avg. Profit Margin",
            value: `${(kpis?.avgProfitMargin || 0).toFixed(1)}%`,
            icon: Activity,
            gradient: "from-[#f59e0b] to-[#fbbf24]",
            bgLight: "bg-amber-50",
            textColor: "text-amber-600",
            iconBg: "bg-gradient-to-br from-[#f59e0b] to-[#fbbf24]",
        },
        {
            label: "Total Orders",
            value: (kpis?.orderCount ?? 0).toLocaleString(),
            icon: ShoppingCart,
            gradient: "from-[#8b5cf6] to-[#a78bfa]",
            bgLight: "bg-violet-50",
            textColor: "text-violet-600",
            iconBg: "bg-gradient-to-br from-[#8b5cf6] to-[#a78bfa]",
        },
    ];

    return (
        <div className="min-h-screen bg-[#f8f9fc]">
            {/* ─── Header Section ─── */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 md:px-10 py-8 md:py-10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand-primary)] to-[#ff6b6b] flex items-center justify-center shadow-lg shadow-red-500/20">
                                    <BarChart3 size={20} className="text-white" />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                    Financial Analytics
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                                Revenue Breakdown
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Real-time platform revenue, commissions & profit insights
                            </p>
                        </div>

                        {/* Date Range & Actions */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5">
                                <Calendar size={16} className="text-gray-400" />
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                                    className="text-sm font-medium text-white bg-transparent focus:outline-none [color-scheme:dark]"
                                />
                                <span className="text-gray-500 text-xs font-medium">→</span>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                                    className="text-sm font-medium text-white bg-transparent focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                            <button
                                onClick={fetchAnalysis}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[var(--brand-primary)] hover:bg-[#c32230] text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                            >
                                <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                                Apply
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/10 rounded-xl text-sm font-medium transition-all">
                                <Download size={16} />
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-6">
                {/* ─── KPI Metric Cards ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {metricCards.map((card, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group relative overflow-hidden"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Decorative gradient corner */}
                            <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${card.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500`} />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-lg`}>
                                        <card.icon size={20} className="text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs font-bold ${card.textColor} ${card.bgLight} px-2.5 py-1 rounded-lg`}>
                                        <ArrowUpRight size={12} />
                                        <span>vs prev</span>
                                    </div>
                                </div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{card.label}</p>
                                <p className="text-2xl font-black text-gray-900">{card.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Secondary KPI Row ─── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: "Seller Earnings", value: formatCurrency(kpis?.totalSellerEarning), icon: Users, color: "#3b82f6" },
                        { label: "Affiliate Earnings", value: formatCurrency(kpis?.totalAffiliateEarning), icon: Award, color: "#8b5cf6" },
                        { label: "Ambassador Earnings", value: formatCurrency(kpis?.totalAmbassadorEarning), icon: TrendingUp, color: "#f59e0b" },
                        { label: "Charity Donations", value: formatCurrency(kpis?.totalCharity), icon: Heart, color: "#E82C3F" },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3 hover:shadow-md transition-all duration-300">
                            <div
                                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: `${item.color}12` }}
                            >
                                <item.icon size={16} style={{ color: item.color }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">{item.label}</p>
                                <p className="text-sm font-bold text-gray-900">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ─── Charts Row: Revenue Trend + Pie ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Revenue & Profit Trend */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 pb-0 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Revenue & Profit Trend</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Daily platform performance over selected period</p>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-1.5 bg-[#E82C3F] rounded-full" />
                                    <span className="text-[11px] font-semibold text-gray-500">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-1.5 bg-[#009639] rounded-full" />
                                    <span className="text-[11px] font-semibold text-gray-500">Profit</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-[380px] w-full px-2 pb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueTrend} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#E82C3F" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#E82C3F" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#009639" stopOpacity={0.15} />
                                            <stop offset="100%" stopColor="#009639" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                        dy={10}
                                        tickFormatter={(val) => moment(val).format('MMM DD')}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                        tickFormatter={(value) => formatCompact(value)}
                                        width={55}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#E82C3F"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#gradRevenue)"
                                        dot={false}
                                        activeDot={{ r: 5, stroke: '#E82C3F', strokeWidth: 2, fill: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="profit"
                                        stroke="#009639"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#gradProfit)"
                                        dot={false}
                                        activeDot={{ r: 5, stroke: '#009639', strokeWidth: 2, fill: '#fff' }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue Split Pie */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-gray-900">Revenue Split</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Distribution of total earnings</p>
                        </div>
                        <div className="flex-1 relative min-h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                        formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, '']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center label */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</p>
                                <p className="text-lg font-black text-gray-900">{formatCompact(kpis?.totalRevenue)}</p>
                            </div>
                        </div>
                        {/* Pie Legend */}
                        <div className="mt-4 space-y-2.5 pt-4 border-t border-gray-50">
                            {pieData.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <span
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: PIE_COLORS[idx] }}
                                        />
                                        <span className="text-xs font-medium text-gray-500">{item.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-gray-900">
                                            {formatCurrency(item.value)}
                                        </span>
                                        <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                            {totalPieValue > 0 ? ((item.value / totalPieValue) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {/* Charity row */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                <div className="flex items-center gap-2.5">
                                    <Heart size={10} className="text-[var(--brand-primary)]" />
                                    <span className="text-xs font-medium text-gray-500">Charity Donations</span>
                                </div>
                                <span className="text-xs font-bold text-gray-900">{formatCurrency(kpis?.totalCharity)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Tables Row: Sellers + Products ─── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Sellers */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Top Sellers</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Ranked by revenue contribution</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                                <Award size={18} className="text-amber-500" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">#</th>
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Seller</th>
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Revenue</th>
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Profit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {sellerBreakdown?.length > 0 ? (
                                        sellerBreakdown.map((s: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold ${idx === 0 ? "bg-amber-100 text-amber-700" :
                                                        idx === 1 ? "bg-gray-100 text-gray-600" :
                                                            idx === 2 ? "bg-orange-100 text-orange-700" :
                                                                "bg-gray-50 text-gray-400"
                                                        }`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-900 text-sm">{s.sellerName}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-[var(--brand-primary)] text-sm">{formatCurrency(s.revenue)}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-[var(--brand-secondary)] text-sm">{formatCurrency(s.profit)}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Users size={32} className="text-gray-200" />
                                                    <p className="text-sm text-gray-400 font-medium">No seller data for this period</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 flex items-center justify-between border-b border-gray-50">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Top Products</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Best sellers by revenue</p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Package size={18} className="text-blue-500" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-gray-50/80">
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">#</th>
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Product</th>
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Sold</th>
                                        <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {data?.topProducts?.length > 0 ? (
                                        data.topProducts.map((p: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-bold ${idx === 0 ? "bg-amber-100 text-amber-700" :
                                                        idx === 1 ? "bg-gray-100 text-gray-600" :
                                                            idx === 2 ? "bg-orange-100 text-orange-700" :
                                                                "bg-gray-50 text-gray-400"
                                                        }`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {p.thumbnail ? (
                                                            <img
                                                                src={p.thumbnail}
                                                                alt={p.name}
                                                                className="w-10 h-10 rounded-xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                                <Package size={16} className="text-gray-300" />
                                                            </div>
                                                        )}
                                                        <span className="font-semibold text-gray-900 text-sm line-clamp-1">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-50 text-xs font-bold text-gray-600">
                                                        {p.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="font-bold text-[var(--brand-primary)] text-sm">{formatCurrency(p.revenue)}</span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-16 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package size={32} className="text-gray-200" />
                                                    <p className="text-sm text-gray-400 font-medium">No product data available</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ─── Category Insights Bar Chart ─── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                    <div className="p-6 flex items-center justify-between border-b border-gray-50">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Category Performance</h2>
                            <p className="text-xs text-gray-400 mt-0.5">Revenue distribution across product categories</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                            <BarChart3 size={18} className="text-violet-500" />
                        </div>
                    </div>
                    <div className="h-[320px] w-full p-6 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryBreakdown} layout="vertical" margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    type="number"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                    tickFormatter={(value) => formatCompact(value)}
                                />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#374151', fontWeight: 600 }}
                                    width={120}
                                />
                                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#E82C3F" />
                                        <stop offset="100%" stopColor="#ff6b6b" />
                                    </linearGradient>
                                </defs>
                                <Bar
                                    dataKey="value"
                                    fill="url(#barGradient)"
                                    radius={[0, 8, 8, 0]}
                                    barSize={28}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
