"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orderService } from "@/lib/services/front-end/orderService";
import { CheckCircle2, Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import Image from "next/image";

interface SelectedVariantData {
  id: number;
  sizeId?: number;
  colorId?: number;
  sizeName?: string | null;
  colorName?: string | null;
  hexCode?: string | null;
  price: number;
  variantImages:any | []
}

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  selectedVariantData?: SelectedVariantData | null;
  product?: {
    id: number;
    title: string;
    productimage?: { url: string }[];
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  orderItems: OrderItem[];
  createdAt: string;
}

export default function OrderSuccessPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  // ✅ Fetch Order
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Please login to view your order details.",
        onConfirm: () => router.push("/login"),
      });
      setLoading(false);
      return;
    }

    const token = session?.user?.token;
    if (id && token) {
      (async () => {
        try {
          const res = await orderService.getById(token, Number(id));
          console.log('res.data:>',res)
          setOrder(res.data);
        } catch (error) {
          console.error("❌ Failed to fetch order:", error);
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: "Failed to fetch order details. Please try again.",
            onConfirm: () =>
              setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [status, session?.user?.token, id, router]);

  if (loading) {
    return (
      <section className="flex justify-center items-center min-h-[60vh]">
        <Loader />
      </section>
    );
  }

  if (!order) {
    return (
      <section className="flex flex-col justify-center items-center min-h-[60vh] text-center p-6">
        <ShoppingBag size={48} className="text-[var(--brand-primary)] mb-4" />
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          Order not found
        </h2>
        <p className="text-[var(--text-muted)] mb-6 max-w-sm">
          We couldn’t find the order you’re looking for.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-[var(--brand-primary)] text-white rounded-full font-medium hover:bg-[var(--brand-secondary)] transition"
        >
          Back to Shop
        </Link>

        <PopupAlert
          type={popUpAlertData.type as any}
          message={popUpAlertData.message}
          confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
          cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
          onConfirm={popUpAlertData.onConfirm}
          onCancel={popUpAlertData.onCancel}
          show={popUpAlertData.isOpen}
        />
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-10 py-16 bg-[var(--soft-gray)]/30 rounded-2xl">
      {/* ✅ Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <div className="bg-white shadow-sm rounded-full p-3 border border-[var(--soft-gray)] flex items-center justify-center">
            <CheckCircle2 size={48} className="text-[var(--brand-secondary)]" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight mb-1">
          Order Confirmed
        </h1>

        <p className="text-[var(--text-secondary)] text-base">
          Thank you for your purchase!
        </p>

        <p className="text-[var(--text-muted)] text-sm mt-1">
          Your order{" "}
          <span className="font-medium text-[var(--brand-primary)]">
            #{order.id}
          </span>{" "}
          has been successfully placed.
        </p>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* 🛍 Left - Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[var(--soft-gray)] p-6 md:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 tracking-tight">
            Items in your order
          </h2>

          <ul className="divide-y divide-[var(--soft-gray)]">
            {order.orderItems.map((item,index) => (
              <li
                key={index}
                className="flex justify-between items-start gap-4 py-5"
              >
                <div className="flex gap-4">
                  {/* 🖼 Image */}
                  <div className="relative w-28 aspect-square rounded-xl overflow-hidden border border-[var(--soft-gray)] flex-shrink-0 bg-white">
                    {item.product?.productimage?.[0]?.url ? (
                      <Image
                        src={item?.selectedVariantData?.variantImages[0]?.url || item.product.productimage[0].url}
                        alt={item.product.title}
                        fill
                        className="object-contain p-2"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package
                          size={36}
                          className="text-[var(--mid-gray)]"
                          strokeWidth={1.5}
                        />
                      </div>
                    )}
                  </div>

                  {/* 📄 Title & Qty */}
                  <div className="flex flex-col justify-center">
                    <p className="font-medium text-[var(--text-primary)] text-base line-clamp-2">
                      {item.product?.title}
                    </p>

                    {(item.selectedVariantData?.colorName ||
                      item.selectedVariantData?.sizeName) && (
                      <div className="text-xs text-[var(--text-secondary)] mt-1 flex flex-wrap items-center gap-2">
                        {item.selectedVariantData?.colorName && (
                          <span className="flex items-center gap-1">
                            Color: {item.selectedVariantData.colorName}
                            {item.selectedVariantData.hexCode && (
                              <span
                                className="inline-block w-3 h-3 rounded-full border"
                                style={{
                                  backgroundColor:
                                    item.selectedVariantData.hexCode,
                                }}
                              />
                            )}
                          </span>
                        )}
                        {item.selectedVariantData?.sizeName && (
                          <span>Size: {item.selectedVariantData.sizeName}</span>
                        )}
                      </div>
                    )}

                    <p className="text-[var(--text-muted)] text-sm mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>

                {/* 💰 Price */}
                <div className="font-semibold text-[var(--brand-primary)] whitespace-nowrap">
                  £{item.price.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 📄 Right - Summary */}
        <div className="bg-white rounded-2xl border border-[var(--soft-gray)] p-6 md:p-8 lg:sticky lg:top-20 h-fit shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6 tracking-tight">
            Order Summary
          </h2>

          <div className="space-y-4 text-[var(--text-primary)]">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>£{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span className="text-[var(--text-muted)]">Free</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-[var(--soft-gray)] pt-4">
              <span>Total</span>
              <span className="text-[var(--brand-primary)]">
                £{order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-full font-semibold hover:bg-[var(--brand-secondary)] transition"
            >
              <ShoppingBag size={20} />
              Continue Shopping
            </Link>

            <Link
              href={`/orders/${order.id}`}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-[var(--brand-primary)] text-[var(--brand-primary)] rounded-full font-semibold hover:bg-[var(--brand-primary)] hover:text-white transition"
            >
              View Order Details
            </Link>
          </div>
        </div>
      </div>

      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
        cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
        onConfirm={popUpAlertData.onConfirm}
        onCancel={popUpAlertData.onCancel}
        show={popUpAlertData.isOpen}
      />
    </section>
  );
}
