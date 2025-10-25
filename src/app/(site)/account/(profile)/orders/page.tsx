"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { orderService } from "@/lib/services/front-end/orderService";
import Loader from "@/components/Loader";
import Link from "next/link";
import Image from "next/image";
import { Package, ShoppingBag, ChevronRight } from "lucide-react";

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

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    const token = session?.user?.token;
    if (token) {
      (async () => {
        try {
          const res = await orderService.getAll(token);
          setOrders(
            (res.data || []).sort(
              (a: Order, b: Order) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          );
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [status, session, router]);

  if (loading) return <Loader />;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const statusBadge = (status: string) => {
    const normalized = status.toLowerCase();
    const base =
      "px-3 py-1 text-xs font-medium rounded-full capitalize border";

    if (normalized === "completed")
      return (
        <span className={`${base} bg-green-50 text-green-700 border-green-200`}>
          Completed
        </span>
      );
    if (normalized === "pending")
      return (
        <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>
          Pending
        </span>
      );
    if (normalized === "cancelled")
      return (
        <span className={`${base} bg-red-50 text-red-700 border-red-200`}>
          Cancelled
        </span>
      );

    return (
      <span className={`${base} bg-gray-100 text-gray-700 border-gray-200`}>
        {normalized}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-5 pt-1 pb-10">
      {/* 🧭 Page Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            My Orders
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Review your recent purchases and order history
          </p>
        </div>
      </div>

      {/* 📦 Orders Container */}
      <div className="bg-white border border-[var(--soft-gray)] rounded-2xl shadow-sm p-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag size={50} className="text-[var(--brand-primary)] mb-4" />
            <p className="text-[var(--text-secondary)] mb-3">
              You have no orders yet.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-primary)] text-white rounded-full font-medium hover:bg-[var(--brand-secondary)] transition"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-7">
            {orders.map((order) => (
              <div
                key={order.id}
                className="group border border-[var(--soft-gray)] rounded-xl p-6 hover:shadow-lg hover:border-[var(--brand-primary)] transition-all duration-300 bg-white"
              >
                {/* 🧾 Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-3">
                  <div>
                    <h3 className="font-semibold text-lg text-[var(--text-primary)]">
                      Order #{order.id}
                    </h3>
                    <p className="text-[var(--text-muted)] text-sm">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(order.status)}
                    <span className="font-semibold text-[var(--brand-primary)] text-lg">
                      £{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 🖼 Product Preview */}
                <div className="flex gap-4 overflow-x-auto pb-3">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative w-24 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] bg-white flex-shrink-0 group-hover:border-[var(--brand-primary)] transition"
                    >
                      {item.product?.productimage?.[0]?.url ? (
                        <Image
                          src={item.product.productimage[0].url}
                          alt={item.product.title}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Package size={28} className="text-[var(--mid-gray)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 📄 Footer */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-5 gap-3">
                  <div className="text-[var(--text-muted)] text-sm">
                    {/* Status: <span className="capitalize">{order.status}</span> ·{" "} */}
                    Payment: {order.paymentMethod}{" "}
                    {order.platform && `(${order.platform})`}
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2 text-sm font-medium bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-secondary)] transition"
                  >
                    View Details
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
