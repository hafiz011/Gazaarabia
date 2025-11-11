"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import Image from "next/image";
import {
  ShoppingBag,
  Package,
  Truck,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import ReviewModal from "@/components/ReviewModal";
import { CheckCircle } from "lucide-react";
import ReturnRequestModal from "@/components/ReturnRequestModal.tsx";
import ReturnStatusModal from "@/components/ReturnStatusModal";


interface SelectedVariantData {
  id: number;
  sizeId?: number;
  colorId?: number;
  sizeName?: string | null;
  colorName?: string | null;
  hexCode?: string | null;
  price: number;
  variantImages: any | []
}

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  selectedVariantData?: SelectedVariantData | null;
  product: {
    id: number;
    title: string;
    productimage?: { url: string }[];
  };
  reviewed: boolean;
  returnRequests?: {
    id: number;
    status: string;
    note?: string;
    adminNote?: string;
    refundAmount?: number;
    createdAt?: string;
    images?: string[];
    reason: { label: string };
  }[];
}

// interface Order {
//   id: number;
//   totalAmount: number;
//   status: string;
//   paymentMethod: string;
//   platform?: string | null;
//   createdAt: string;
//   orderItems: OrderItem[];
//   firstName?: string;
//   lastName?: string;
//   company?: string;
//   address1?: string;
//   address2?: string;
//   city?: string;
//   country?: string;
//   postalCode?: string;
//   phone?: string;
// }

interface Order {
  id: number;
  subtotal: number;
  discountTotal: number;
  shippingCost: number;
  totalAmount: number;
  couponCode?: string | null;
  couponDiscount?: number | null;
  status: string;
  paymentMethod: string;
  platform?: string | null;
  createdAt: string;
  orderItems: OrderItem[];
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  phone?: string;
}


export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ isOpen: false, message: "", type: "" });

  //  Review modal states
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedOrderItemId, setSelectedOrderItemId] = useState<number>(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [returnModal, setReturnModal] = useState(false);
  const [returnStatusModal, setReturnStatusModal] = useState(false);


  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setPopup({
        isOpen: true,
        message: "Please login to view your order details.",
        type: "warning",
      });
      return;
    }

    const token = session?.user?.token;
    if (id && token) {
      (async () => {
        try {
          const res = await orderService.getById(token, Number(id));
          setOrder(res.data);
        } catch (err) {
          console.error("Failed to fetch order", err);
          setPopup({
            isOpen: true,
            message: "Failed to fetch order details. Please try again.",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [id, session, status]);


  const handleSuccessReviewed = () => {
    // 1. Close the modal
    setReviewModal(false);

    //  2. Optimistically update the reviewed status in the UI
    setOrder((prevOrder) => {
      if (!prevOrder) return prevOrder;

      return {
        ...prevOrder,
        orderItems: prevOrder.orderItems.map((orderItem) =>
          orderItem.product.id === selectedProductId &&
            orderItem.selectedVariantData?.id === selectedVariantId
            ? { ...orderItem, reviewed: true }  //  set reviewed to true
            : orderItem
        ),
      };
    });

    // 3. Show success popup
    setTimeout(() => {
      setPopup({
        isOpen: true,
        message: "Thank you for your review!",
        type: "success",
      });
    }, 300);
  }

  if (loading) return <Loader />;

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-center p-6">
        <ShoppingBag size={48} className="text-[var(--brand-primary)] mb-4" />
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Order not found
        </h2>
        <p className="text-[var(--text-muted)] mb-6">
          We couldn’t find the order you’re looking for.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-full font-medium hover:bg-[var(--brand-secondary)] transition"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6 md:p-10 mt-7">
      {/*  Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Order #{order.id}
        </h1>
        <p className="text-[var(--text-secondary)]">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>

        {order.couponCode && (order.couponDiscount ?? 0) > 0 && (
          <p className="mt-3 text-sm text-green-600 flex items-center justify-start gap-2">
            <CheckCircle size={16} className="text-green-500" />
            You saved <b>£{(order.couponDiscount ?? 0).toFixed(2)}</b> using coupon{" "}
            <b>{order.couponCode}</b>!
          </p>
        )}

      </div>

      {/* 🛍 Order Summary */}
      <div className="bg-[var(--soft-gray)] rounded-2xl shadow-sm p-6 mb-10">
        <h2 className="text-xl font-semibold mb-5 text-[var(--text-primary)]">
          Order Summary
        </h2>

        {/* <ul className="divide-y divide-[var(--mid-gray)]">
          {order.orderItems.map((item) => (


            <li
              key={item.id}
              className="flex flex-col md:flex-row gap-4 py-4 border-b border-[var(--mid-gray)]"
            > */}


        <ul className="divide-y divide-[var(--mid-gray)]">
          {order.orderItems.map((item) => (
            <li
              key={item.id}
              className="flex flex-col md:flex-row gap-4 py-4"
            >

              {/* Product Image */}
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative w-24 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] flex-shrink-0 bg-white">
                  {item.product?.productimage?.[0]?.url ? (
                    <Image
                      src={item?.selectedVariantData?.variantImages[0]?.url || item.product.productimage[0].url}
                      alt={item.product.title}
                      fill
                      className="object-contain p-1"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      <Package size={28} className="text-[var(--mid-gray)]" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-start w-full">
                  {/* Title (left) + Price (right) */}
                  <div className="flex items-start justify-between w-full">
                    <p className="font-semibold text-[var(--text-primary)] text-base leading-snug line-clamp-2 flex-1 pr-2">
                      {item.product.title}
                    </p>
                    <div className="font-semibold text-[var(--brand-primary)] text-sm md:text-base whitespace-nowrap">
                      £{item.price.toFixed(2)}
                    </div>
                  </div>

                  {/*  Color/Size/Qty (left) + Write Review (right) */}
                  <div className="flex items-center justify-between mt-1 w-full flex-wrap gap-2">
                    {/* Left section */}
                    <div className="text-xs text-[var(--text-secondary)] flex flex-wrap items-center gap-2">
                      {item.selectedVariantData?.colorName && (
                        <span className="flex items-center gap-1">
                          Color: {item.selectedVariantData.colorName}
                          {item.selectedVariantData.hexCode && (
                            <span
                              className="inline-block w-3 h-3 rounded-full border"
                              style={{
                                backgroundColor: item.selectedVariantData.hexCode,
                              }}
                            />
                          )}
                        </span>
                      )}
                      {item.selectedVariantData?.sizeName && (
                        <span>Size: {item.selectedVariantData.sizeName}</span>
                      )}
                      <span>Qty: {item.quantity}</span>
                    </div>

                    {/* Right Section */}
                    {order.status === "completed" && (
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-2 md:mt-0">

                        {item.reviewed ? (
                          <div className="flex items-center gap-1 text-green-600 bg-green-50 border border-green-300 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap">
                            <CheckCircle size={14} className="text-green-600" />
                            <span>Review Submitted</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedOrderItemId(item.id);
                              setSelectedProductId(item.product.id);
                              setSelectedVariantId(item.selectedVariantData?.id || null);
                              setReviewModal(true);
                            }}
                            className="text-xs px-3 py-1 border border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-full hover:bg-[var(--brand-primary)] hover:text-white transition whitespace-nowrap"
                          >
                            Write Review
                          </button>
                        )}

                        {/* Return Status */}
                        {(() => {
                          const rr = item.returnRequests?.[0];

                          if (!rr) {
                            return (
                              <button
                                onClick={() => {
                                  setSelectedOrderItemId(item.id);
                                  setReturnModal(true);
                                }}
                                className="text-xs px-3 py-1 border border-red-500 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition whitespace-nowrap"
                              >
                                Return Item
                              </button>
                            );
                          }

                          const statusStyles: Record<string, string> = {
                            pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
                            approved: "bg-blue-100 text-blue-700 border border-blue-300",
                            returned: "bg-orange-100 text-orange-700 border border-orange-300",
                            refunded: "bg-green-100 text-green-700 border border-green-300",
                            rejected: "bg-red-100 text-red-700 border border-red-300",
                          };

                          return (
                            <span
                              onClick={() => { setSelectedOrderItemId(item.id); setReturnStatusModal(true) }}
                              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${statusStyles[rr.status]} cursor-pointer`}
                            >
                              {rr.status === "pending" && "Return Requested"}
                              {rr.status === "approved" && "Approved - Awaiting Return"}
                              {rr.status === "returned" && "Returned - Refund Pending"}
                              {rr.status === "refunded" && "Refund Completed"}
                              {rr.status === "rejected" && "Return Rejected"}
                            </span>
                          );
                        })()}

                      </div>
                    )}

                  </div>
                </div>
              </div>

            </li>


          ))}
        </ul>

        {/* <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--mid-gray)]">
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            Total
          </span>
          <span className="text-xl font-bold text-[var(--brand-primary)]">
            £{order.totalAmount.toFixed(2)}
          </span>
        </div> */}

        <div className="mt-6 pt-4 border-t border-[var(--mid-gray)] space-y-2 text-sm text-[var(--text-primary)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>£{(order.subtotal ?? order.totalAmount).toFixed(2)}</span>
          </div>

          {/* Coupon discount line */}
          {order.couponCode && (order.couponDiscount ?? 0) > 0 && (
            <div className="flex justify-between text-[var(--brand-secondary)]">
              <span className="flex items-center gap-1">
                <CheckCircle size={14} className="text-[var(--brand-secondary)]" />
                Coupon ({order.couponCode})
              </span>
              <span>-£{(order.couponDiscount ?? 0).toFixed(2)}</span>
            </div>
          )}

          {/* Shipping (optional) */}
          {order.shippingCost > 0 ? (
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>£{order.shippingCost.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Shipping</span>
              <span>Free</span>
            </div>
          )}

          {/* Final Total */}
          <div className="flex justify-between items-center border-t border-[var(--mid-gray)] pt-3 mt-2">
            <span className="text-lg font-semibold text-[var(--text-primary)]">
              Total
            </span>
            <span className="text-xl font-bold text-[var(--brand-primary)]">
              £{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>


      </div>

      {/*  Payment & Shipping */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="p-5 bg-white rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
            Payment Information
          </h3>
          <p className="text-[var(--text-secondary)]">
            Method: <span className="font-medium">{order.paymentMethod}</span>
          </p>
          <p className="text-[var(--text-secondary)] capitalize">
            Status:{" "}
            <span className="font-medium text-[var(--brand-secondary)]">
              {order.status}
            </span>
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border shadow-sm">
          <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">
            Shipping Information
          </h3>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Truck size={18} className="text-[var(--brand-primary)]" />
            <span>Standard shipping (3–5 business days)</span>
          </div>
        </div>
      </div>

      {/*  Delivery Address */}
      <div className="p-5 bg-white rounded-xl border shadow-sm mb-10">
        <h3 className="text-lg font-semibold mb-3 text-[var(--text-primary)] flex items-center gap-2">
          <MapPin size={20} className="text-[var(--brand-primary)]" />
          Delivery Address
        </h3>
        <div className="text-[var(--text-secondary)] space-y-1">
          <p className="font-medium">
            {order.firstName} {order.lastName}
          </p>
          {order.company && <p>{order.company}</p>}
          <p>{order.address1}</p>
          {order.address2 && <p>{order.address2}</p>}
          <p>
            {order.city}, {order.country} {order.postalCode}
          </p>
          {order.phone && (
            <p className="flex items-center gap-2">
              <Phone size={14} /> {order.phone}
            </p>
          )}
        </div>
      </div>

      {/*  CTA */}
      <div className="mt-10 flex justify-end">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-full font-semibold hover:bg-[var(--brand-secondary)] transition"
        >
          <ShoppingBag size={20} />
          Continue Shopping
        </Link>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          orderItemId={selectedOrderItemId}
          productId={selectedProductId}
          variantId={selectedVariantId}
          token={session?.user?.token as string}
          onClose={() => setReviewModal(false)}
          onSuccess={() => {
            handleSuccessReviewed()
          }}
        />
      )}

      {/*  RETURN STATUS MODAL */}
      {returnStatusModal && (
        <ReturnStatusModal
          returnRequest={order.orderItems.find(i => i.id === selectedOrderItemId)?.returnRequests?.[0] || null}
          onClose={() => setReturnStatusModal(false)}
        />
      )}


      {returnModal && (
        <ReturnRequestModal
          orderId={order.id}
          orderItemId={selectedOrderItemId}
          token={session?.user?.token as string}
          onClose={() => setReturnModal(false)}
          onSuccess={() => {
            setReturnModal(false);
            setPopup({
              isOpen: true,
              message: "Return request submitted successfully!",
              type: "success",
            });
          }}
        />
      )}


      {/* Popup Alert */}
      <PopupAlert
        type={popup.type as any}
        message={popup.message}
        confirmText="OK"
        onConfirm={() => setPopup((prev) => ({ ...prev, isOpen: false }))}  //  close popup
        show={popup.isOpen}
      />

    </section>
  );
}
