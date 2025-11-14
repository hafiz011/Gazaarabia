"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye, X, Phone } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { orderAdminService } from "@/lib/services/orderAdminService";
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
  coupon?: {
    code: string;
    discountType: string;
    discountValue: number;
  } | null;

  affiliate?: {
    user: { name: string; email: string };
  } | null;
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
        const res = await orderAdminService.getAll(token, debouncedSearch);
        setOrders(res.data || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
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
      {/* Header */}
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

      {/* Orders Table */}
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
                    <td className="py-3 px-5 font-medium">{order.id}</td>
                    <td className="py-3 px-5">{order.transactionId ?? "N/A"}</td>
                    <td className="py-3 px-5 text-gray-600">{order.user.name ?? "N/A"}</td>
                    <td className="py-3 px-5 font-medium text-gray-900">{formatGBP(order.totalAmount)}</td>
                    <td className="py-3 px-5 text-gray-600">{order.paymentMethod ?? "N/A"}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white/80 rounded-2xl w-full max-w-3xl shadow-lg overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-start px-6 py-5 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Placed on {new Date(order.createdAt).toLocaleString("en-GB")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold rounded-full ${getStatusClass(
                order.status
              )}`}
            >
              {order.status}
            </span>
            <button onClick={onClose} className="text-gray-500 hover:text-[var(--brand-primary)]">
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-8">
          {/* Payment Info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h3>
            <div className="border p-3 rounded-lg bg-white/60 text-sm text-gray-700 space-y-2">
              <p>Method: {order.paymentMethod.toUpperCase()}</p>
              <p>Transaction ID: {order.transactionId ?? "N/A"}</p>
              <p>Email: {order.user.email}</p>
            </div>
          </section>

          {/* Discount / Affiliate Info */}
          {/* {(order.coupon || order.affiliate) && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Discount & Affiliate Details</h3>
              <div className="border p-3 rounded-lg bg-white/60 text-sm text-gray-700 leading-snug space-y-2">

                {order.coupon && (
                  <p>
                    <span className="font-medium text-gray-800">Coupon Used:</span>{" "}
                    <span className="text-[var(--brand-primary)] font-semibold">{order.coupon.code}</span>{" "}
                    ({order.coupon.discountType === "percentage"
                      ? `${order.coupon.discountValue}% off`
                      : `£${order.coupon.discountValue} off`}
                    )
                  </p>
                )}

                {order.couponDiscount > 0 && (
                  <p>
                    <span className="font-medium text-gray-800">Discount Applied:</span>{" "}
                    {formatGBP(order.couponDiscount)}
                  </p>
                )}

                {order.affiliate && (
                  <p>
                    <span className="font-medium text-gray-800">Referred By:</span>{" "}
                    {order.affiliate.user.name}{" "}
                    <span className="text-gray-500 text-xs">({order.affiliate.user.email})</span>
                  </p>
                )}
              </div>
            </section>
          )} */}

          {/* Discount / Affiliate Info */}
          {(order.coupon || order.couponDiscount > 0 || order.affiliate) && (
            <section>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {order.affiliate || order.coupon?.affiliateId
                  ? "Affiliate & Discount Details"
                  : order.coupon || order.couponDiscount > 0
                    ? "Discount Details"
                    : "Affiliate Details"}
              </h3>


              <div className="border p-3 rounded-lg bg-white/60 text-sm text-gray-700 leading-snug space-y-2">

                {/* Coupon Used */}
                {order.coupon && (
                  <p>
                    <span className="font-medium text-gray-800">Coupon Used:</span>{" "}
                    <span className="text-[var(--brand-primary)] font-semibold">{order.coupon.code}</span>{" "}
                    ({order.coupon.discountType === "percentage"
                      ? `${order.coupon.discountValue}% off`
                      : `£${order.coupon.discountValue} off`}
                    )
                  </p>
                )}

                {/* Discount Value */}
                {order.couponDiscount > 0 && (
                  <p>
                    <span className="font-medium text-gray-800">Discount Applied:</span>{" "}
                    {formatGBP(order.couponDiscount)}
                  </p>
                )}

                {/* Affiliate Link (Affiliate Coupon) */}
                {order.coupon?.affiliateId && order.affiliate && (
                  <p>
                    <span className="font-medium text-gray-800">Referred By:</span>{" "}
                    {order.affiliate.user.name}{" "}
                    <span className="text-gray-500 text-xs">({order.affiliate.user.email})</span>
                    <span className="ml-2 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Affiliate Coupon
                    </span>
                  </p>
                )}

                {/* Admin Coupon (no affiliateId) */}
                {order.coupon && !order.coupon.affiliateId && (
                  <p>
                    <span className="font-medium text-gray-800">Coupon Type:</span>{" "}
                    <span className="ml-1 text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Admin / Sitewide Coupon
                    </span>
                  </p>
                )}

              </div>
            </section>
          )}


          {/* Address */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery Address</h3>
            <div className="border p-3 rounded-lg bg-white/60 text-sm text-gray-700 leading-snug space-y-1">
              <p>
                {order.firstName} {order.lastName}
              </p>
              {order.company && <p>{order.company}</p>}
              <p>{order.address1}</p>
              {order.address2 && <p>{order.address2}</p>}
              <p>
                {order.city}, {order.country}
              </p>
              <p>{order.postalCode}</p>
              {order.phone && (
                <p className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-500" />
                  {order.phone}
                </p>
              )}

            </div>
          </section>

          {/* Order Items */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Order Items</h3>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b text-gray-700 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="py-2 px-3 text-left">Item</th>
                    <th className="py-2 px-3 text-left">Variant</th>
                    <th className="py-2 px-3 text-center w-16">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                    <th className="py-2 px-3 text-center w-24">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.length > 0 ? (
                    order.orderItems.map((item: OrderItem, idx: number) => (
                      <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100/60`}>
                        <td className="py-3 px-4 font-medium text-gray-900">{item.product?.title}</td>
                        <td className="py-3 px-4 text-left text-gray-700">
                          {item.variant?.sku || "N/A"}
                          {item.variant?.color?.name && (
                            <span className="ml-2 text-gray-500">({item.variant.color.name})</span>
                          )}
                          {item.variant?.size?.name && (
                            <span className="ml-1 text-gray-500">- {item.variant.size.name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">{formatGBP(item.price)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatGBP(item.price * item.quantity)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.reviewed && item.review ? (
                            <button
                              onClick={() => onViewReview(item.review)}
                              className="text-[var(--brand-primary)] text-xs font-medium hover:underline"
                            >
                              View
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-gray-500">
                        No order items found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 bg-white border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Close
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-white/90 rounded-2xl w-full max-w-md shadow-lg overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-white">
          <h2 className="text-lg font-semibold text-gray-800">Customer Review</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-[var(--brand-primary)] transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill={star <= review.rating ? "#FACC15" : "#E5E7EB"}
                className="w-5 h-5"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.959a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.959c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.959a1 1 0 00-.364-1.118L2.064 9.386c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.285-3.959z" />
              </svg>
            ))}
          </div>

          {/* Product */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
              {review.product?.productimage?.[0]?.url ? (
                <img
                  src={review.product.productimage[0].url}
                  alt={review.product.title}
                  className="w-full h-full object-contain bg-white"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {review.product?.title || "Product Title"}
              </p>
              {review.variant?.sku && (
                <p className="text-xs text-gray-500">SKU: {review.variant.sku}</p>
              )}
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm text-gray-700 leading-relaxed italic border-t pt-3">
            “{review.comment || "No comment provided."}”
          </p>

          {/* Info */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <p>
              <span className="font-medium text-gray-700">Reviewer:</span>{" "}
              {review.user?.name || "Customer"}{" "}
              <span className="text-gray-400">({review.user?.email})</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Date:</span>{" "}
              {new Date(review.createdAt).toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
