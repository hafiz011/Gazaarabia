"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import Image from "next/image";
import { ShoppingBag, Package, Truck } from "lucide-react";
import Link from "next/link";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
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
  platform?: string | null;
  createdAt: string;
  orderItems: OrderItem[];
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState({ isOpen: false, message: "", type: "" });

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
          setOrder(res);
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
      {/* 🧾 Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Order #{order.id}
        </h1>
        <p className="text-[var(--text-secondary)]">
          Placed on {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* 🛍 Order Summary */}
      <div className="bg-[var(--soft-gray)] rounded-2xl shadow-sm p-6 mb-10">
        <h2 className="text-xl font-semibold mb-5 text-[var(--text-primary)]">
          Order Summary
        </h2>

        <ul className="divide-y divide-[var(--mid-gray)]">
          {order.orderItems.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-stretch gap-4 py-4"
            >
              {/* 🖼 Image Section (CartDrawer Style) */}
              <div className="flex items-stretch gap-4">
                <div className="relative w-24 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] flex-shrink-0 bg-white">
                  {item.product?.productimage?.[0]?.url ? (
                    <Image
                      src={item.product.productimage[0].url}
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

                {/* 📝 Product Info */}
                <div className="flex flex-col justify-center">
                  <p className="font-semibold text-[var(--text-primary)] line-clamp-2">
                    {item.product.title}
                  </p>
                  <p className="text-[var(--text-muted)] text-sm mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>

              {/* 💰 Price */}
              <div className="font-semibold text-[var(--brand-primary)] whitespace-nowrap self-center">
                £{item.price.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-[var(--mid-gray)]">
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            Total
          </span>
          <span className="text-xl font-bold text-[var(--brand-primary)]">
            £{order.totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 💳 Payment & Shipping */}
      <div className="grid md:grid-cols-2 gap-6">
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

      {/* 🛍 CTA */}
      <div className="mt-10 flex justify-end">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-full font-semibold hover:bg-[var(--brand-secondary)] transition"
        >
          <ShoppingBag size={20} />
          Continue Shopping
        </Link>
      </div>

      <PopupAlert
        type={popup.type as any}
        message={popup.message}
        confirmText="OK"
        onConfirm={() => setPopup((prev) => ({ ...prev, isOpen: false }))}
        show={popup.isOpen}
      />
    </section>
  );
}
