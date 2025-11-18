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
  selectedVariantData: any | []
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
    <div className="max-w-6xl mx-auto px-4 pt-1 pb-10">

      {/* PAGE HEADER */}
      <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            My Orders
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Review your recent purchases and order history
          </p>
        </div>
      </div>

      {/* ORDERS WRAPPER */}
      <div className="bg-white border border-[var(--soft-gray)] rounded-2xl shadow-sm p-4 md:p-6">

        {/* EMPTY STATE */}
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
          <div className="space-y-6 md:space-y-7">

            {orders.map((order) => (
              <div
                key={order.id}
                className="group border border-[var(--soft-gray)] rounded-xl p-4 md:p-6 hover:shadow-lg hover:border-[var(--brand-primary)] transition-all duration-300 bg-white"
              >

                {/* ORDER HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-5 gap-2 md:gap-3">
                  <div>
                    <h3 className="font-semibold text-lg md:text-xl text-[var(--text-primary)] leading-tight">
                      Order #{order.id}
                    </h3>
                    <p className="text-[var(--text-muted)] text-xs md:text-sm">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 md:gap-3">
                    {statusBadge(order.status)}
                    <span className="font-semibold text-[var(--brand-primary)] text-base md:text-lg">
                      £{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* PRODUCT SCROLLER – MOBILE-FIRST */}
                <div className="flex gap-3 overflow-x-auto pb-2 md:pb-3 scrollbar-hide">
                  {order.orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="relative w-20 md:w-24 aspect-square rounded-lg overflow-hidden border border-[var(--soft-gray)] bg-white flex-shrink-0 group-hover:border-[var(--brand-primary)] transition"
                    >
                      {(item?.selectedVariantData?.variantImages?.[0]?.url ||
                        item.product?.productimage?.[0]?.url) ? (
                        <Image
                          src={
                            item?.selectedVariantData?.variantImages?.[0]?.url ||
                            item.product?.productimage?.[0]?.url
                          }
                          alt={item.product.title}
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <Package size={26} className="text-[var(--mid-gray)]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* FOOTER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 md:mt-5 gap-2 md:gap-3">

                  <div className="text-[var(--text-muted)] text-xs md:text-sm leading-relaxed">
                    Payment: {order.paymentMethod}
                    {order.platform && ` (${order.platform})`}
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs md:text-sm font-medium bg-[var(--brand-primary)] text-white rounded-full hover:bg-[var(--brand-secondary)] transition"
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
