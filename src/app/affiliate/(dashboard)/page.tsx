"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  ClipboardCheck,
  Tag,
  Wallet,
  Users,
  TrendingUp,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { affiliateService } from "@/lib/services/affiliateService";
import { OrderDetailsModal } from "@/components/affiliate/OrderDetailsModal";

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  //  Format money
  const formatGBP = (amount: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

  //  Status pill color
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Authentication & fetch dashboard data
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return router.replace(ROUTES.AFFILIATE.LOGIN);
    if (session?.user?.role !== "affiliate") return router.replace(ROUTES.HOME);

    (async () => {
      try {
        const res = await affiliateService.getDashboard(token as string);
        setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session, status, token, router]);

  if (loading) return <Loader />;
  if (!dashboardData) return <div className="p-6 text-center text-gray-500">No dashboard data available.</div>;

  // Top-level combined summary cards
  const combinedStats = [
    {
      label: "Total Combined Earnings",
      value: formatGBP(dashboardData.totalCombinedEarnings),
      icon: <DollarSign size={28} />,
      color: "text-green-600",
    },
    {
      label: "Pending Combined",
      value: formatGBP(dashboardData.pendingCombinedPayouts),
      icon: <Wallet size={28} />,
      color: "text-yellow-600",
    },
    {
      label: "Total (Orders + Items)",
      value: dashboardData.totalOrders + dashboardData.totalAmbassadorItems,
      icon: <ClipboardCheck size={28} />,
      color: "text-blue-600",
    },
    {
      label: "Referred Customers",
      value: dashboardData.referredCustomers,
      icon: <Users size={28} />,
      color: "text-orange-600",
    },
  ];

  const affiliateStats = [
    { label: "Affiliate Earnings", value: formatGBP(dashboardData.totalAffiliateEarnings), icon: <DollarSign size={28} />, color: "text-green-600" },
    { label: "Pending Payouts", value: formatGBP(dashboardData.pendingAffiliatePayouts), icon: <Wallet size={28} />, color: "text-yellow-600" },
    { label: "Total Orders", value: dashboardData.totalOrders, icon: <ClipboardCheck size={28} />, color: "text-blue-600" },
    { label: "Active Coupons", value: dashboardData.activeCoupons, icon: <Tag size={28} />, color: "text-purple-600" },
  ];

  const ambassadorStats = [
    { label: "Ambassador Earnings", value: formatGBP(dashboardData.totalAmbassadorEarnings), icon: <DollarSign size={28} />, color: "text-green-600" },
    { label: "Pending Ambassador", value: formatGBP(dashboardData.pendingAmbassadorPayouts), icon: <Wallet size={28} />, color: "text-yellow-600" },
    { label: "Items Sold", value: dashboardData.totalAmbassadorItems, icon: <ClipboardCheck size={28} />, color: "text-blue-600" },
    // Optionally show average commission
  ];

  return (
    <div className="space-y-8 p-6">

      {/* Combined Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {combinedStats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-5 shadow flex items-center gap-4">
            <div className={`${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-lg font-semibold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two sections side-by-side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Affiliate Section */}
        <div className="bg-white rounded-xl border p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Affiliate Summary</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {affiliateStats.map((st) => (
              <div key={st.label} className="p-4 rounded-md border">
                <p className="text-xs text-gray-500">{st.label}</p>
                <p className="text-lg font-semibold">{st.value}</p>
              </div>
            ))}
          </div>

          <h4 className="text-md font-medium mb-3">Recent Affiliate Orders</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                  <th className="px-5 py-3 text-left">Order ID</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentOrders.length > 0 ? (
                  dashboardData.recentOrders.map((order: any) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{order.orderId}</td>
                      <td className="px-5 py-3">{formatGBP(order.amount)}</td>
                      <td className="px-5 py-3 text-gray-600">
                        {new Date(order.date).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-[var(--brand-primary)] hover:underline inline-flex items-center gap-1"
                        >
                          <Eye size={16} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">No recent orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ambassador Section */}
        <div className="bg-white rounded-xl border p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Ambassador Summary</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {ambassadorStats.map((st) => (
              <div key={st.label} className="p-4 rounded-md border">
                <p className="text-xs text-gray-500">{st.label}</p>
                <p className="text-lg font-semibold">{st.value}</p>
              </div>
            ))}
          </div>

          <h4 className="text-md font-medium mb-3">Recent Ambassador Items</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-600 text-xs uppercase">
                  <th className="px-5 py-3 text-left">Item ID</th>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Qty</th>
                  <th className="px-5 py-3 text-left">Earned</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentAmbassadorItems.length > 0 ? (
                  dashboardData.recentAmbassadorItems.map((it: any) => (
                    <tr key={it.itemId} className="border-b hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{it.itemId}</td>
                      <td className="px-5 py-3 text-gray-600">{it.orderId}</td>
                      <td className="px-5 py-3">{it.productTitle}</td>
                      <td className="px-5 py-3">{it.qty}</td>
                      <td className="px-5 py-3 font-semibold">£{it.earned.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500">No recent ambassador activity.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/*  Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          formatGBP={formatGBP}
          getStatusClass={getStatusClass}
        />
      )}

    </div>
  );
}
