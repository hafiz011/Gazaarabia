"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Layers,
  ShoppingBag,
  Tag,
  Palette,
  ClipboardList,
  Truck,
  Droplets,
  Ruler,
  Grid,
  Users as UsersIcon,
  ClipboardCheck
} from "lucide-react";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import { dashboardService } from "@/lib/services/dashboardService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";



export default function DashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);



  // const DUMMY_ORDERS_CHART = [
  //   { date: "2026-01-28", orders: 1 },
  //   { date: "2026-01-29", orders: 3 },
  //   { date: "2026-01-30", orders: 2 },
  //   { date: "2026-01-31", orders: 5 },
  //   { date: "2026-02-01", orders: 4 },
  //   { date: "2026-02-02", orders: 2 },
  //   { date: "2026-02-03", orders: 1 },
  // ];

  // const DUMMY_REVENUE_CHART = [
  //   { date: "2026-01-28", revenue: 450 },
  //   { date: "2026-01-29", revenue: 1200 },
  //   { date: "2026-01-30", revenue: 800 },
  //   { date: "2026-01-31", revenue: 2100 },
  //   { date: "2026-02-01", revenue: 1600 },
  //   { date: "2026-02-02", revenue: 2298 },
  //   { date: "2026-02-03", revenue: 43 },
  // ];



  const ordersChartData =
    dashboardData?.charts?.ordersOverTime &&
      Object.keys(dashboardData.charts.ordersOverTime).length > 0
      ? Object.entries(dashboardData.charts.ordersOverTime).map(
        ([date, count]: any) => ({
          date,
          orders: count,
        })
      )
      : [] // DUMMY_ORDERS_CHART;

  const revenueChartData =
    dashboardData?.charts?.revenueOverTime &&
      Object.keys(dashboardData.charts.revenueOverTime).length > 0
      ? Object.entries(dashboardData.charts.revenueOverTime).map(
        ([date, amount]: any) => ({
          date,
          revenue: amount,
        })
      )
      : [] //DUMMY_REVENUE_CHART;



  const orderStatusData = dashboardData?.charts?.orderStatus || [];


  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (!session?.user?.token) return;
    (async () => {
      try {
        const data = await dashboardService.getDashboard(session.user.token);
        setDashboardData(data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  const sections = [
    { key: "users", label: "Users", icon: <UsersIcon size={28} />, path: "/admin/users" },
    { key: "sellers", label: "Sellers", icon: <UsersIcon size={28} />, path: "/admin/seller" },
    { key: "orders", label: "Orders", icon: <ClipboardCheck size={28} />, path: "/admin/orders" },
    { key: "blogCategories", label: "Blog Categories", icon: <Layers size={28} />, path: "/admin/blog-categories" },
    { key: "blogs", label: "Blogs", icon: <FileText size={28} />, path: "/admin/blogs" },
    { key: "brands", label: "Brands", icon: <Tag size={28} />, path: "/admin/brands" },
    { key: "sizes", label: "Sizes", icon: <Ruler size={28} />, path: "/admin/sizes" },
    { key: "colors", label: "Colors", icon: <Palette size={28} />, path: "/admin/colors-list" },
    { key: "categories", label: "Categories", icon: <ClipboardList size={28} />, path: "/admin/category-list" },
    { key: "subcategories", label: "Subcategories", icon: <Grid size={28} />, path: "/admin/subcategories" },
    { key: "deliveryOptions", label: "Delivery Options", icon: <Truck size={28} />, path: "/admin/delivery-options" },
    { key: "materialCares", label: "Material Cares", icon: <Droplets size={28} />, path: "/admin/material-cares" },
    { key: "products", label: "Products", icon: <ShoppingBag size={28} />, path: "/admin/products" },
  ];


  if (loading) {
    return <div className="p-6 text-center text-[var(--text-primary)]">Loading Dashboard...</div>;
  }

  if (!dashboardData) {
    return <div className="p-6 text-center text-[var(--brand-primary)] font-medium">Failed to load dashboard.</div>;
  }

  return (
    <div className="space-y-10">
      {/*  Quick Access Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        {sections.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.path)}
            className="group bg-[var(--white)] rounded-xl border border-[var(--soft-gray)] p-5 flex flex-col items-center justify-center gap-2 text-center shadow-sm hover:shadow-md transition cursor-pointer hover:border-[var(--brand-primary)]"
          >
            <div className="text-[var(--brand-primary)] group-hover:scale-110 transition">
              {item.icon}
            </div>
            <p className="text-[15px] font-medium text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]">
              {item.label}
            </p>
            <p className="text-sm text-[var(--text-muted)] font-semibold">
              {dashboardData[item.key] ?? 0} total
            </p>
          </button>
        ))}
      </div>

      {/*  Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Over Time */}
        <div className="bg-white rounded-xl p-6 border border-[var(--soft-gray)] shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Orders Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ordersChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Over Time */}
        <div className="bg-white rounded-xl p-6 border border-[var(--soft-gray)] shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Recent Blogs */}
      <div className="bg-[var(--white)] rounded-xl shadow p-6 border border-[var(--soft-gray)] mt-8">
        <h3 className="text-lg font-semibold mb-4 text-[var(--text-primary)]">Recent Blogs</h3>
        <div className="divide-y divide-[var(--soft-gray)]">
          {dashboardData.recentBlogs?.length > 0 ? (
            dashboardData.recentBlogs.map((blog: any) => (
              <div key={blog.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{blog.title}</p>
                  <p className="text-[var(--text-muted)] text-sm">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/admin/blogs/form/${blog.id}`)}
                  className="px-3 py-1 text-sm rounded-md border border-[var(--mid-gray)] text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition"
                >
                  View
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--text-muted)] py-3 text-center">
              No recent blogs found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
