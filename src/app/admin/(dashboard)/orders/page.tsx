"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, X } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { orderAdminService } from "@/lib/services/orderAdminService";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: number;
  orderNumber: string;
  transactionId:any,
  user: any;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  // email?: string;
  address?: string;
  tax:any,
  shipping:any,
  orderItems?: OrderItem[];
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // 🕒 Debounce search term (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 🧭 Fetch Orders with search
  useEffect(() => {
    if (!token) return;
    const isInitial = debouncedSearch === "";
    (async () => {
      try {
        if (isInitial) setInitialLoading(true);
        else setSearchLoading(true);

        const res = await orderAdminService.getAll(token, debouncedSearch);
        setOrders(res.data || []);
      } catch (error) {
        console.error("❌ Failed to fetch orders:", error);
      } finally {
        if (isInitial) setInitialLoading(false);
        else setSearchLoading(false);
      }
    })();
  }, [token, debouncedSearch]);

  const filteredOrders = useMemo(() => orders, [orders]);
  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

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

  const formatGBP = (amount: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

  // const getTotals = (items: OrderItem[]) => {
  //   const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  //   const tax = subtotal * 0.2;
  //   const shipping = 4.99;
  //   const total = subtotal + tax + shipping;
  //   return { subtotal, tax, shipping, total };
  // };

  // 🛡 Access Control & Initial Loader
  if (status === "loading" || initialLoading) return <Loader />;
  if (status === "unauthenticated") {
    router.replace(ROUTES.ADMIN.LOGIN);
    return null;
  }
  if (status === "authenticated" && session?.user?.role !== "admin") {
    router.replace(ROUTES.HOME);
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 🔍 Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Orders Management</h1>
        <div className="relative w-full sm:w-80">
          <Search size={18} className="absolute left-4 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, name, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 rounded-full pl-11 pr-4 py-2 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] bg-gray-50"
          />
        </div>
      </div>

      {/* 📊 Table */}
      <div className="bg-white rounded-xl shadow border border-[var(--soft-gray)] overflow-hidden">
        <div className="overflow-x-auto relative">
          {searchLoading && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
              <span className="text-gray-600 text-sm font-medium">Searching...</span>
            </div>
          )}

          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-medium border-b">
              <tr>
                <th className="py-3 px-5 text-left">Order Id</th>
                <th className="py-3 px-5 text-left">Transaction Id</th>
                <th className="py-3 px-5 text-left">Customer</th>
                <th className="py-3 px-5 text-left">Amount</th>
                <th className="py-3 px-5 text-left">Payment</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-left">Date</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition">
                    {/* <td className="py-3 px-5">{startIndex + idx + 1}</td> */}
                    <td className="py-3 px-5 font-medium">{order.id}</td>
                    <td className="py-3 px-5 font-medium">{order.transactionId ?? "N/A"}</td>
                    <td className="py-3 px-5 text-gray-600">{order.user.name ?? "N/A"}</td>
                    <td className="py-3 px-5 text-gray-800 font-medium">{formatGBP(order.totalAmount)}</td>
                    <td className="py-3 px-5 text-gray-600">{order.paymentMethod ?? "N/A"}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status ?? "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-[var(--brand-primary)] hover:bg-[var(--soft-gray)] p-2 rounded-full transition hover:scale-110"
                      >
                        <Eye size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* 🪟 Modal (same design as before) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl w-full max-w-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-start px-6 py-5 border-b sticky top-0 bg-white/80 backdrop-blur-xl z-10">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
                  Order #{selectedOrder.id}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-GB")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold rounded-full shadow-sm ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </span>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-[var(--brand-primary)] transition"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 py-5 space-y-8">
              {/* Customer Info */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2 text-gray-700 border p-3 rounded-lg bg-white/60">
                    <p><span className="text-gray-500">Name:</span> {selectedOrder.user.name}</p>
                    <p><span className="text-gray-500">Email:</span> {selectedOrder.user.email}</p>
                  </div>
                  <div className="space-y-2 text-gray-700 border p-3 rounded-lg bg-white/60">
                    <p className="text-gray-500 mb-1">Address:</p>
                    <p className="leading-snug">{selectedOrder.address ?? "N/A"}</p>
                  </div>
                </div>
              </section>

              {/* Items */}
              <section>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b text-gray-700 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="py-2 px-3 text-left">Item</th>
                        <th className="py-2 px-3 text-center w-16">Qty</th>
                        <th className="py-2 px-3 text-right">Price</th>
                        <th className="py-2 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems?.map((item:any, idx) => (
                        <tr
                          key={idx}
                          className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100/60 transition`}
                        >
                          <td className="py-2 px-3">{item.product.title}</td>
                          <td className="py-2 px-3 text-center">{item.quantity}</td>
                          <td className="py-2 px-3 text-right">{formatGBP(item.price)}</td>
                          <td className="py-2 px-3 text-right font-medium">
                            {formatGBP(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Totals */}
              {selectedOrder.orderItems && (
                <section className="flex justify-end">
                  {(() => {
                    // const { subtotal, tax, shipping, total } = getTotals(selectedOrder.items!);
                    return (
                      <div className="w-full sm:w-2/3 space-y-2 text-sm rounded-xl p-5 bg-gradient-to-br from-gray-50 to-gray-100 border shadow-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          {/* <span className="font-medium">{formatGBP(subtotal)}</span> */}
                          <span className="font-medium">{formatGBP(selectedOrder.totalAmount)}</span>
                        </div>
                        {/* <div className="flex justify-between">
                          <span className="text-gray-600">Tax (20%)</span>
                          <span className="font-medium">{formatGBP(selectedOrder.tax ?? 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">{formatGBP(selectedOrder.shipping ?? 0)}</span>
                        </div> */}
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between font-semibold text-gray-900 text-lg">
                          <span>Total</span>
                          <span>{formatGBP(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    );
                  })()}
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 flex justify-end gap-3 bg-white/80 sticky bottom-0 border-t backdrop-blur-xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
