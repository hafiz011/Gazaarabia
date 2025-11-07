"use client";

import { X, Phone } from "lucide-react";

export function OrderDetailsModal({ order, onClose, onViewReview, formatGBP, getStatusClass }: any) {
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
              <p>Method: {order.paymentMethod?.toUpperCase()}</p>
              <p>Transaction ID: {order.transactionId ?? "N/A"}</p>
              <p>Email: {order.user?.email}</p>
            </div>
          </section>

          {/* Discount + Affiliate Info */}
          {(order.coupon || order.couponDiscount > 0 || order.affiliate) && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {(order.coupon?.affiliateId || order.affiliate) ? "Affiliate & Discount Details" : "Discount Details"}
              </h3>

              <div className="border p-3 rounded-lg bg-white/60 text-sm leading-snug space-y-2">

                {/* Coupon Used */}
                {order.coupon && (
                  <p>
                    <span className="font-medium text-gray-800">Coupon:</span>{" "}
                    <span className="text-[var(--brand-primary)] font-semibold">{order.coupon.code}</span>{" "}
                    ({order.coupon.discountType === "percentage"
                      ? `${order.coupon.discountValue}%`
                      : `£${order.coupon.discountValue}`}{" "}
                    off)
                  </p>
                )}

                {/* Discount Amount */}
                {order.couponDiscount > 0 && (
                  <p>
                    <span className="font-medium text-gray-800">Discount Applied:</span>{" "}
                    {formatGBP(order.couponDiscount)}
                  </p>
                )}

                {/* Affiliate Who Referred */}
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

              </div>
            </section>
          )}

          {/* Delivery Address */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Delivery Address</h3>
            <div className="border p-3 rounded-lg bg-white/60 text-sm text-gray-700 leading-snug space-y-1">
              <p>{order.firstName} {order.lastName}</p>
              {order.company && <p>{order.company}</p>}
              <p>{order.address1}</p>
              {order.address2 && <p>{order.address2}</p>}
              <p>{order.city}, {order.country}</p>
              <p>{order.postalCode}</p>
              {order.phone && (
                <p className="flex items-center gap-2"><Phone size={16} className="text-gray-500" /> {order.phone}</p>
              )}
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
                    <th className="py-2 px-3 text-left">Variant</th>
                    <th className="py-2 px-3 text-center">Qty</th>
                    <th className="py-2 px-3 text-right">Price</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                    <th className="py-2 px-3 text-center">Review</th>
                  </tr>
                </thead>

                <tbody>
                  {order.orderItems?.length > 0 ? (
                    order.orderItems.map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{item.product?.title}</td>

                        {/* Variant */}
                        <td className="py-3 px-4 text-gray-700">
                          {item.variant?.sku ?? "N/A"}
                          {item.variant?.color?.name && <span className="ml-2 text-gray-500">({item.variant.color.name})</span>}
                          {item.variant?.size?.name && <span className="ml-1 text-gray-500">- {item.variant.size.name}</span>}
                        </td>

                        <td className="py-3 px-4 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-right">{formatGBP(item.price)}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {formatGBP(item.price * item.quantity)}
                        </td>

                        {/* View Review */}
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
                    <tr><td colSpan={6} className="text-center py-5 text-gray-500">No items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end bg-white border-t">
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
