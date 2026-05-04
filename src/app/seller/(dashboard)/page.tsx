"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Users as UsersIcon,
  ClipboardCheck,
  TrendingUp,
  DollarSign,
  Package,
  Star,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye,
  ChevronRight,
  Truck
} from "lucide-react";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import SellerLoader from "@/components/seller/SellerLoader";
import { ROUTES } from "@/constants/routes";
import { dashboardService } from "@/lib/services/seller/dashboardService";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const ordersChartData = dashboardData?.charts?.ordersOverTime
    ? Object.entries(dashboardData.charts.ordersOverTime).map(
      ([date, count]: any) => ({
        name: date,
        orders: count,
      })
    )
    : [];

  const revenueChartData = dashboardData?.charts?.revenueOverTime
    ? Object.entries(dashboardData.charts.revenueOverTime).map(
      ([date, amount]: any) => ({
        name: date,
        revenue: amount,
      })
    )
    : [];

  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.SELLER.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "seller") {
      router.push(ROUTES.HOME);
    }
  }, [status, session?.user?.role, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.token || isFetched) return;
    
    const fetchData = async () => {
      try {
        const data = await dashboardService.getDashboard(session.user.token);
        setDashboardData(data);
        setIsFetched(true);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [status, session?.user?.token, isFetched]);

  if (loading) {
    return <SellerLoader />;
  }

  if (!dashboardData) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-red-100 shadow-sm">
        <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-800 mb-2">Data Unavailable</h2>
        <p className="text-gray-500">We couldn't load your dashboard data right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Store Overview</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`£${dashboardData.revenue?.toLocaleString() || 0}`}
          icon={<DollarSign size={24} />}
          trend="+12.5%"
          trendType="up"
          color="bg-blue-500"
          gradient="from-blue-600 to-blue-400"
        />
        <StatsCard
          title="Total Orders"
          value={dashboardData.orders || 0}
          icon={<ClipboardCheck size={24} />}
          trend="+8.2%"
          trendType="up"
          color="bg-emerald-500"
          gradient="from-emerald-600 to-emerald-400"
        />
        <StatsCard
          title="Avg. Ratings"
          value={`${dashboardData.avgRating || 0} / 5`}
          icon={<Star size={24} />}
          trend="Based on reviews"
          trendType="up"
          color="bg-violet-500"
          gradient="from-violet-600 to-violet-400"
        />
        <StatsCard
          title="Total Products"
          value={dashboardData.products || 0}
          icon={<Package size={24} />}
          trend={dashboardData.lowStock > 0 ? `${dashboardData.lowStock} Low Stock` : "All in stock"}
          trendType={dashboardData.lowStock > 0 ? "down" : "up"}
          color="bg-amber-500"
          gradient="from-amber-600 to-amber-400"
        />
      </div>

      {/* Store Balances & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <div className="lg:col-span-1 bg-gradient-to-br from-[#1e2a4a] to-[#2d3b5d] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 bg-white/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <h3 className="text-white/70 font-medium mb-6 flex items-center gap-2">
            <DollarSign size={20} />
            Available Balance
          </h3>
          <div className="text-4xl font-bold mb-8">
            £{dashboardData.balances?.available?.toLocaleString() || '0.00'}
          </div>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-white/50 text-xs mb-1 uppercase tracking-wider">Pending</p>
              <p className="font-semibold text-lg">£{dashboardData.balances?.pending?.toLocaleString() || '0.00'}</p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-1 uppercase tracking-wider">Total Earned</p>
              <p className="font-semibold text-lg">£{dashboardData.balances?.totalEarned?.toLocaleString() || '0.00'}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/seller/payouts')}
            className="w-full mt-8 bg-white text-[#1e2a4a] py-3 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
          >
            Withdraw Funds
          </button>
        </div>

        {/* Quick Access */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickLink
              icon={<ShoppingBag size={24} />}
              label="Add Product"
              path="/seller/products/form"
              color="bg-blue-50 text-blue-600"
            />
            <QuickLink
              icon={<ClipboardCheck size={24} />}
              label="Orders"
              path="/seller/orders"
              color="bg-emerald-50 text-emerald-600"
            />
            <QuickLink
              icon={<Star size={24} />}
              label="Reviews"
              path="/seller/reviews"
              color="bg-amber-50 text-amber-600"
            />
            <QuickLink
              icon={<Truck size={24} />}
              label="Logistics"
              path="/seller/delivery-settings"
              color="bg-purple-50 text-purple-600"
            />
          </div>

          <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
            <div className="bg-amber-500 p-2 rounded-lg text-white">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Inventory Alert</h4>
              <p className="text-amber-800 text-sm">
                You have {dashboardData.lowStock} products running low on stock. Update them now to avoid losing sales.
              </p>
              <button
                onClick={() => router.push('/seller/products')}
                className="mt-2 text-amber-900 font-bold text-sm underline flex items-center gap-1"
              >
                View Products <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Revenue Performance</h3>
            <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--brand-primary)"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Bar Chart */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-900">Orders Overview</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-gray-500 font-medium">Daily Orders</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={ordersChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {/* Recent Orders */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <button
              onClick={() => router.push('/seller/orders')}
              className="text-sm font-bold text-[var(--brand-primary)] hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {dashboardData.recentOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">#{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">£{order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'paid' || order.status === 'delivered'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
          </div>
          <div className="p-6 space-y-6">
            {dashboardData.topProducts?.map((product: any, idx: number) => (
              <div key={product.id} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center font-bold text-gray-400">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{product.title}</h4>
                  <p className="text-xs text-gray-500">£{product.price} • {product.salesCount} sales</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm">
                  <ArrowUpRight size={16} />
                  Top
                </div>
              </div>
            ))}
            {(!dashboardData.topProducts || dashboardData.topProducts.length === 0) && (
              <div className="py-10 text-center text-gray-400">
                No sales data yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, trend, trendType, color, gradient }: any) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition group overflow-hidden relative">
      <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-5 group-hover:scale-150 transition-transform duration-700`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
          {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ icon, label, path, color }: any) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(path)}
      className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
    >
      <div className={`p-4 rounded-2xl ${color} shadow-sm group-hover:scale-110 transition`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-gray-700">{label}</span>
    </button>
  );
}
