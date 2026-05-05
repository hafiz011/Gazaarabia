"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, X, Phone, ShoppingBag, DollarSign, Clock, CheckCircle, Package, TrendingUp } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import SellerLoader from "@/components/seller/SellerLoader";
import { orderSellerService } from "@/lib/services/seller/orderSellerService";
import React from "react";

interface Variant {
  sku?: string;
  color?: { name: string };
  size?: { name: string };
}

interface Product {
  title: string;
  productimage?: { url: string }[];
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: Product;
  variant?: Variant;
  reviewed: boolean;
  review?: any;
  commissionValue: number;
  commissionAmount: number;
  sellerEarning: number;
  payoutDays: number;
  isPayoutEligible: boolean;
  isPaidOut: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Order {
  id: number;
  transactionId: string | null;
  paymentMethod: string;
  itemsTotal: number;
  charityAmount: number;
  discountTotal: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  user: User;
  firstName: string;
  lastName: string | null;
  company?: string | null;
  address1: string;
  address2?: string | null;
  city: string;
  country: string;
  postalCode: string;
  phone?: string | null;
  orderItems: OrderItem[];
  couponDiscount: number;
  referralDiscount: number;
  shippingCost?: number;
  taxTotal?: number;
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
    affiliateId?: number | null;
  } | null;

  affiliate?: {
    user: { name: string; email: string };
  } | null;
  charityAnonymous?: boolean;
  charityName?: string;
  charityEmail?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!token) return;
    const isInitial = debouncedSearch === "";
    (async () => {
      try {
        if (isInitial) setInitialLoading(true);
        else setSearchLoading(true);
        const res = await orderSellerService.getAll(token, debouncedSearch, currentPage, pageSize);
        setOrders(res.data || []);
        setTotalCount(res.total || 0);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        if (isInitial) setInitialLoading(false);
        else setSearchLoading(false);
      }
    })();
  }, [token, debouncedSearch, currentPage, pageSize]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((acc, order) =>
      acc + order.orderItems.reduce((a, i) => a + (i.price * i.quantity), 0), 0);
    const totalEarnings = orders.reduce((acc, order) =>
      acc + order.orderItems.reduce((a, i) => a + (i.sellerEarning * i.quantity), 0), 0);
    const pendingOrders = orders.filter(o => o.status.toLowerCase() === "pending").length;

    return [
      { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "blue", bg: "bg-blue-50", text: "text-blue-600" },
      { label: "Earnings", value: `£${totalEarnings.toFixed(2)}`, icon: DollarSign, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600" },
      { label: "Pending Orders", value: pendingOrders, icon: Clock, color: "orange", bg: "bg-orange-50", text: "text-orange-600" },
    ];
  }, [orders]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedOrders = orders; // Already paginated from API

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "processing":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatGBP = (amount: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

  if (status === "loading" || initialLoading) return <SellerLoader />;
  if (status === "unauthenticated") {
    router.replace(ROUTES.SELLER.LOGIN);
    return null;
  }
  if (status === "authenticated" && session?.user?.role !== "seller") {
    router.replace(ROUTES.HOME);
    return null;
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your sales and order fulfillment.</p>
        </div>
        <div className="relative group w-full lg:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search orders, customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm 
                       focus:outline-none focus:ring-4 focus:ring-[var(--brand-primary)]/10 focus:border-[var(--brand-primary)] 
                       transition-all duration-300 shadow-sm"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.text} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden relative">
        {searchLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 text-sm font-semibold">Updating results...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Commission</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Total Amt.</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Earnings</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Payout</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="py-5 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order, idx) => (
                  <tr key={idx} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg text-xs">#{order.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{order.user.name ?? "N/A"}</span>
                        {/* <span className="text-xs text-gray-400">{order.user.email}</span> */}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                          {formatGBP(order.orderItems.reduce((acc, item) => acc + item.commissionAmount * item.quantity, 0))}
                        </span>
                        <span className="text-[10px] text-gray-400 ml-1">
                          {Array.from(new Set(order.orderItems.map(i => i.commissionValue))).join(", ")}% Avg
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">
                        {formatGBP(order.orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0))}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[var(--brand-primary)]">
                        {formatGBP(order.orderItems.reduce((acc, item) => acc + item.sellerEarning * item.quantity, 0))}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${order.orderItems.some(i => i.isPaidOut) ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                          {order.orderItems.some(i => i.isPaidOut) ? "Paid" : "Pending"}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">
                          {Math.max(...order.orderItems.map(i => i.payoutDays))}d Cycle
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${getStatusClass(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white hover:bg-[var(--brand-primary)] text-gray-400 hover:text-white p-2.5 rounded-xl border border-gray-100 hover:border-[var(--brand-primary)] transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 group"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
                        <Package size={32} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-gray-900 font-semibold">No orders found</p>
                        <p className="text-gray-400 text-sm mt-1">Adjust your search or filters to see more results.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )}
      </div>

      {/*  Order Details Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onViewReview={setSelectedReview}
          formatGBP={formatGBP}
          getStatusClass={getStatusClass}
        />
      )}

      {/*  Review Modal */}
      {selectedReview && <ReviewModal review={selectedReview} onClose={() => setSelectedReview(null)} />}
    </div>
  );
}

/* ---------------------------------------------------
    Order Modal Component
--------------------------------------------------- */
function OrderModal({ order, onClose, onViewReview, formatGBP, getStatusClass }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md animate-fadeIn top-14">
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900">Order <span className="text-[var(--brand-primary)]">#{order.id}</span></h2>
              <span className={`px-4 py-1 text-[10px] font-bold rounded-full border shadow-sm ${getStatusClass(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1 font-medium">
              Placed on {new Date(order.createdAt).toLocaleString("en-GB", { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-rose-50 text-gray-400 hover:text-rose-500 p-3 rounded-2xl transition-all duration-300 group"
          >
            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-8 py-8 space-y-8 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Delivery & Payment */}
            <div className="space-y-8">
              {/* Delivery Address */}
              <section className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Package size={14} /> Shipping Destination
                </h3>
                <div className="space-y-1 text-gray-700">
                  <p className="text-lg font-bold text-gray-900">{order.firstName} {order.lastName}</p>
                  {order.company && <p className="text-sm text-gray-500">{order.company}</p>}
                  <div className="mt-4 space-y-0.5 text-sm font-medium">
                    <p>{order.address1}</p>
                    {order.address2 && <p>{order.address2}</p>}
                    <p>{order.city}, {order.country}</p>
                    <p className="text-gray-400 font-mono">{order.postalCode}</p>
                  </div>
                  {/* {order.phone && (
                    <div className="flex items-center gap-2 mt-4 text-[var(--brand-primary)] bg-[var(--brand-primary)]/5 w-fit px-3 py-2 rounded-xl border border-[var(--brand-primary)]/10">
                      <Phone size={14} />
                      <span className="text-sm font-bold tracking-tighter">{order.phone}</span>
                    </div>
                  )} */}
                </div>
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <div className="space-y-8">
              {/* Discounts & Affiliate */}
              {(order.coupon || order.couponDiscount > 0 || order.affiliate) && (
                <section className="bg-indigo-50/30 rounded-3xl p-6 border border-indigo-100/50">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Promotions & Partners</h3>
                  <div className="space-y-3">
                    {order.coupon && (
                      <div className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm border border-indigo-50">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <CheckCircle size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Coupon</p>
                            <p className="text-sm font-black text-indigo-600">{order.coupon.code}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-lg">
                          {order.coupon.discountType === "percentage" ? `${order.coupon.discountValue}%` : `£${order.coupon.discountValue}`}
                        </span>
                      </div>
                    )}
                    {order.affiliate && (
                      <div className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-indigo-50">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                          {order.affiliate.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Referred By</p>
                          <p className="text-sm font-bold text-gray-900">{order.affiliate.user.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Order Items Table */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShoppingBag size={14} /> Product Manifest
              </h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{order.orderItems?.length || 0} Items</span>
            </div>
            <div className="border border-gray-100 rounded-[2rem] overflow-hidden bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                  <tr>
                    <th className="py-4 px-6">Product Item</th>
                    <th className="py-4 px-6">Attributes</th>
                    <th className="py-4 px-6 text-center">Qty</th>
                    <th className="py-4 px-6 text-right">Unit Price</th>
                    <th className="py-4 px-6 text-right">Subtotal</th>
                    <th className="py-4 px-6 text-center">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {order.orderItems?.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900">{item.product?.title}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-2">
                          {item.variant?.sku && <span className="text-[10px] font-mono font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">SKU: {item.variant.sku}</span>}
                          {item.variant?.color?.name && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{item.variant.color.name}</span>}
                          {item.variant?.size?.name && <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{item.variant.size.name}</span>}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-900 font-bold text-sm">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-gray-600">{formatGBP(item.price)}</td>
                      <td className="py-4 px-6 text-right font-black text-gray-900">{formatGBP(item.price * item.quantity)}</td>
                      <td className="py-4 px-6 text-center">
                        {item.reviewed && item.review ? (
                          <button
                            onClick={() => onViewReview(item.review)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight transition-colors"
                          >
                            Read Review
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-300 uppercase italic">No Review</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-10 py-3.5 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-sm transition-all duration-300 hover:shadow-xl active:scale-95"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   Review Modal Component
--------------------------------------------------- */
function ReviewModal({ review, onClose }: any) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fadeIn">
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900">Customer Feedback</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 bg-white rounded-xl shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 text-center">
          {/* Star Rating */}
          <div className="flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={star <= review.rating ? "#F59E0B" : "#E2E8F0"}
                className={`w-10 h-10 transition-transform ${star <= review.rating ? 'scale-110 drop-shadow-md' : ''}`}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-3xl p-4 flex items-center gap-4 text-left border border-gray-100">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white shadow-sm flex-shrink-0 bg-white">
              {review.product?.productimage?.[0]?.url ? (
                <img
                  src={review.product.productimage[0].url}
                  alt={review.product.title}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <Package size={20} className="text-gray-300" />
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Review for</p>
              <p className="text-sm font-bold text-gray-900 line-clamp-1">{review.product?.title}</p>
              {review.variant?.sku && <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {review.variant.sku}</p>}
            </div>
          </div>

          {/* Comment */}
          <div className="relative">
            <div className="absolute -top-4 -left-2 text-6xl text-gray-100 font-serif leading-none">“</div>
            <p className="text-lg text-gray-700 italic font-medium leading-relaxed px-4 relative z-10">
              {review.comment || "No comment provided."}
            </p>
            <div className="absolute -bottom-10 -right-2 text-6xl text-gray-100 font-serif leading-none rotate-180">“</div>
          </div>

          {/* Footer Info */}
          <div className="pt-8 border-t border-gray-50 flex flex-col items-center gap-1">
            <p className="text-sm font-black text-gray-900">{review.user?.name || "Customer"}</p>
            <p className="text-xs text-gray-400">{review.user?.email}</p>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">
              {new Date(review.createdAt).toLocaleDateString("en-GB", { dateStyle: 'full' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
