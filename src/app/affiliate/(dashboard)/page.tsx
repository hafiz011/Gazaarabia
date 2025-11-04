"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign,
  ClipboardCheck,
  Tag,
  Wallet,
  Users,
  TrendingUp,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);

  //  Simulated static data
  const [dashboardData, setDashboardData] = useState<any>({
    totalEarnings: 14250,
    pendingPayouts: 1200,
    totalOrders: 85,
    activeCoupons: 5,
    referredCustomers: 23,
    conversionRate: "4.3%",
    recentOrders: [
      { id: 101, orderId: "ORD-2342", amount: 2400, date: "2025-11-02", status: "Completed" },
      { id: 102, orderId: "ORD-2351", amount: 1800, date: "2025-11-03", status: "Pending" },
      { id: 103, orderId: "ORD-2357", amount: 3200, date: "2025-11-03", status: "Completed" },
    ],
  });

  //  Auth check
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "affiliate") {
      router.replace(ROUTES.HOME);
    } else {
      setLoading(false);
    }
  }, [status, session, router]);

  if (loading) {
    return <div className="p-6 text-center text-[var(--text-primary)]">Loading Dashboard...</div>;
  }

  const stats = [
    {
      label: "Total Earnings",
      value: `₹${dashboardData.totalEarnings.toLocaleString()}`,
      icon: <DollarSign size={28} />,
      color: "text-green-600",
    },
    {
      label: "Pending Payouts",
      value: `₹${dashboardData.pendingPayouts.toLocaleString()}`,
      icon: <Wallet size={28} />,
      color: "text-yellow-600",
    },
    {
      label: "Total Orders",
      value: dashboardData.totalOrders,
      icon: <ClipboardCheck size={28} />,
      color: "text-blue-600",
    },
    {
      label: "Active Coupons",
      value: dashboardData.activeCoupons,
      icon: <Tag size={28} />,
      color: "text-purple-600",
    },
    {
      label: "Referred Customers",
      value: dashboardData.referredCustomers,
      icon: <Users size={28} />,
      color: "text-orange-600",
    },
    {
      label: "Conversion Rate",
      value: dashboardData.conversionRate,
      icon: <TrendingUp size={28} />,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-10">
      {/* 💰 Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {stats.map((item) => (
          <div
            key={item.label}
            className="group bg-[var(--white)] rounded-xl border border-[var(--soft-gray)] p-5 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow-md transition cursor-pointer hover:border-[var(--brand-primary)]"
          >
            <div className={`${item.color} group-hover:scale-110 transition`}>
              {item.icon}
            </div>
            <p className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
              {item.label}
            </p>
            <p className="text-lg font-semibold text-[var(--text-primary)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/*  Recent Orders */}
      <div className="bg-[var(--white)] rounded-xl shadow p-6 border border-[var(--soft-gray)] mt-8">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--background)] text-left text-[var(--text-secondary)] text-sm">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {dashboardData.recentOrders.length > 0 ? (
                dashboardData.recentOrders.map((order: any) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--soft-gray)] hover:bg-[var(--background)] transition"
                  >
                    <td className="py-3 px-4 font-medium text-[var(--text-primary)]">
                      {order.orderId}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-primary)]">
                      ₹{order.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`py-3 px-4 font-medium ${
                        order.status === "Completed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {order.status}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push(`/affiliate/orders/${order.id}`)}
                        className="text-[var(--brand-primary)] font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-6 text-[var(--text-muted)]"
                  >
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
