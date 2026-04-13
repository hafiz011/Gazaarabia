"use client";

import { useState, useEffect, useCallback, use } from "react";
import {
    ChevronLeft,
    TrendingUp,
    ShoppingCart,
    Package,
    DollarSign,
    CheckCircle,
    XCircle,
    User,
    Mail,
    Phone,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Wallet,
    Edit2,
    Save,
    X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import moment from "moment";

interface SellerData {
    seller: {
        id: number;
        shopName: string;
        status: string;
        createdAt: string;
        availableBalance: number;
        commissionValue: number | null;
        user: {
            id: number;
            name: string;
            email: string;
            phone: string | null;
        };
    };
    metrics: {
        totalRevenue: number;
        totalEarning: number;
        totalCommission: number;
        totalOrders: number;
        totalProducts: number;
        avgOrderValue: number;
    };
    payouts: {
        totalPaid: number;
        pendingPayout: number;
        currentBalance: number;
    };
    topProducts: any[];
    recentOrders: any[];
    salesTrend: any[];
}

export default function SellerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session, status } = useSession();

    const [loading, setLoading] = useState(true);
    const [sellerData, setSellerData] = useState<SellerData | null>(null);
    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    const [isEditingCommission, setIsEditingCommission] = useState(false);
    const [newCommissionValue, setNewCommissionValue] = useState<number | string>("");

    const token = session?.user?.token;

    const fetchSellerDetails = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const response = await fetch(`/api/seller/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setSellerData(data.data);
            } else {
                setPopUpAlertData({
                    isOpen: true,
                    type: "error",
                    message: data.message || "Failed to fetch seller details.",
                    onConfirm: () => router.push(ROUTES.ADMIN.SELLER),
                });
            }
        } catch (error) {
            console.error("Error fetching seller details:", error);
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Network error occurred.",
                onConfirm: () => router.push(ROUTES.ADMIN.SELLER),
            });
        } finally {
            setLoading(false);
        }
    }, [token, id, router]);

    useEffect(() => {
        if (status === "loading") return;

        console.log("Seller Details Page - ID:", id);
        console.log("Seller Details Page - Session Role:", session?.user?.role);

        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (status === "authenticated" && session?.user?.role?.toLowerCase() !== "admin") {
            console.warn("Unauthorized role detected. Redirecting to home.");
            router.replace(ROUTES.HOME);
        } else if (status === "authenticated") {
            fetchSellerDetails();
        }
    }, [status, session, router, fetchSellerDetails, id]);

    const handleStatusChange = async (newStatus: string) => {
        try {
            const response = await fetch(`/api/seller/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                setPopUpAlertData({
                    isOpen: true,
                    type: "success",
                    message: `Seller status updated to ${newStatus}.`,
                    onConfirm: () => {
                        setPopUpAlertData(prev => ({ ...prev, isOpen: false }));
                        fetchSellerDetails();
                    },
                });
            } else {
                setPopUpAlertData({
                    isOpen: true,
                    type: "error",
                    message: data.message || "Update failed.",
                    onConfirm: () => setPopUpAlertData(prev => ({ ...prev, isOpen: false })),
                });
            }
        } catch (error) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Network error occurred.",
                onConfirm: () => setPopUpAlertData(prev => ({ ...prev, isOpen: false })),
            });
        }
    };

    const handleUpdateCommission = async () => {
        const val = Number(newCommissionValue);
        if (isNaN(val) || val < 0 || val > 100) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Please enter a valid percentage between 0 and 100.",
                onConfirm: () => setPopUpAlertData(prev => ({ ...prev, isOpen: false })),
            });
            return;
        }

        try {
            const response = await fetch(`/api/seller/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ commissionValue: val }),
            });
            const data = await response.json();
            if (data.success) {
                setPopUpAlertData({
                    isOpen: true,
                    type: "success",
                    message: "Seller commission updated successfully.",
                    onConfirm: () => {
                        setPopUpAlertData(prev => ({ ...prev, isOpen: false }));
                        setIsEditingCommission(false);
                        fetchSellerDetails();
                    },
                });
            } else {
                setPopUpAlertData({
                    isOpen: true,
                    type: "error",
                    message: data.message || "Update failed.",
                    onConfirm: () => setPopUpAlertData(prev => ({ ...prev, isOpen: false })),
                });
            }
        } catch (error) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Network error occurred.",
                onConfirm: () => setPopUpAlertData(prev => ({ ...prev, isOpen: false })),
            });
        }
    };

    if (loading || !sellerData) {
        return <div className="min-h-screen flex items-center justify-center"><Loader /></div>;
    }

    const { seller, metrics, payouts, recentOrders, topProducts, salesTrend } = sellerData;

    // Format chart data
    const chartData = (salesTrend || []).map(item => ({
        date: moment(item.createdAt).format("MMM DD"),
        amount: item._sum.subtotal || 0,
    })).sort((a, b) => moment(a.date, "MMM DD").unix() - moment(b.date, "MMM DD").unix());

    const metricCards = [
        { label: "Total Revenue", value: `$${metrics.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "blue" },
        { label: "Seller Earning", value: `$${metrics.totalEarning.toLocaleString()}`, icon: DollarSign, color: "green" },
        { label: "Total Orders", value: metrics.totalOrders, icon: ShoppingCart, color: "purple" },
        { label: "Products", value: metrics.totalProducts, icon: Package, color: "orange" },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{seller.shopName}</h1>
                        <p className="text-sm text-gray-500">Seller ID: #{seller.id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${seller.status === "active" ? "bg-green-100 text-green-700" :
                        seller.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                        }`}>
                        {seller.status}
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    {seller.status !== "active" && (
                        <button
                            onClick={() => handleStatusChange("active")}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                        >
                            <CheckCircle size={18} /> Approve Seller
                        </button>
                    )}
                    {seller.status !== "suspended" && (
                        <button
                            onClick={() => handleStatusChange("suspended")}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                        >
                            <XCircle size={18} /> Suspend Seller
                        </button>
                    )}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metricCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-${card.color}-50 text-${card.color}-600`}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{card.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Sales Trend (Last 7 Days)</h2>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            <span>Daily Revenue</span>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`$${value}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAmount)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Profile Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-6 font-primary">Seller Information</h2>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Manager</p>
                                <p className="font-semibold text-gray-900">{seller.user.name}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Mail size={16} className="text-gray-400" />
                                <span>{seller.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={16} className="text-gray-400" />
                                <span>{seller.user.phone || "No phone provided"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar size={16} className="text-gray-400" />
                                <span>Joined {moment(seller.createdAt).format("MMM DD, YYYY")}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Financial Overview</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Current Balance</span>
                                    <span className="font-bold text-green-600">${payouts.currentBalance.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Pending Payout</span>
                                    <span className="font-bold text-yellow-600">${payouts.pendingPayout.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Commission Rate</span>
                                    <div className="flex items-center gap-2">
                                        {isEditingCommission ? (
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={newCommissionValue}
                                                    onChange={(e) => setNewCommissionValue(e.target.value)}
                                                    className="w-16 px-1 py-0.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                                <button
                                                    onClick={handleUpdateCommission}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                    title="Save"
                                                >
                                                    <Save size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setIsEditingCommission(false)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Cancel"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-blue-600">{seller.commissionValue ?? 0}%</span>
                                                <button
                                                    onClick={() => {
                                                        setNewCommissionValue(seller.commissionValue ?? 0);
                                                        setIsEditingCommission(true);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit Commission"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Recent Orders & Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
                    </div>
                    <div className="overflow-x-auto text-primary">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.length > 0 ? (
                                    recentOrders.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-blue-600 font-mono">#{item.order.id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[150px]">
                                                {item.product.title}
                                            </td>
                                            <td className="px-6 py-4 font-semibold">${item.subtotal}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.order.status === "completed" ? "bg-green-100 text-green-700" :
                                                    item.order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                                                        "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {item.order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No recent orders</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h2 className="text-lg font-bold text-gray-900">Top Performing Products</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {topProducts.length > 0 ? (
                            topProducts.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-gray-400">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Product #{p.productId}</p>
                                            <p className="text-xs text-gray-500">{p._sum.quantity} units sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">${p._sum.subtotal.toLocaleString()}</p>
                                        <div className="flex items-center justify-end gap-1 text-[10px] text-green-600 font-bold">
                                            <ArrowUpRight size={10} /> 12%
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center text-gray-500">No product data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Popup */}
            <PopupAlert
                type={popUpAlertData.type as any}
                message={popUpAlertData.message}
                confirmText="OK"
                onConfirm={popUpAlertData.onConfirm || (() => setPopUpAlertData(prev => ({ ...prev, isOpen: false })))}
                show={popUpAlertData.isOpen}
            />
        </div>
    );
}