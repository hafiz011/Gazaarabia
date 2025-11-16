"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ambassadorOrderService } from "@/lib/services/ambassadorOrderService";
import { X } from "lucide-react";
import { ROUTES } from "@/constants/routes";

export default function AmbassadorOrderItemDetails() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();

    const token = session?.user?.token;
    const affiliateType = session?.user?.affiliateType;

    const [item, setItem] = useState<any>(null);

    // -------------------------------------------------------------
    //  ACCESS CONTROL
    // -------------------------------------------------------------
    useEffect(() => {
        if (status === "loading") return;

        // Not logged in → redirect to login
        if (status === "unauthenticated") {
            router.replace(ROUTES.AFFILIATE.LOGIN);
            return;
        }

        // Logged in but not affiliate → redirect home
        if (session?.user?.role !== "affiliate") {
            router.replace(ROUTES.HOME);
            return;
        }

        // Logged in affiliate but not ambassador → deny access
        if (affiliateType !== "ambassador") {
            router.replace("/affiliate");
            return;
        }
    }, [status, session, router]);
    // -------------------------------------------------------------


    useEffect(() => {
        if (token) loadData();
    }, [token]);

    const loadData = async () => {
        try {
            const res = await ambassadorOrderService.getOne(token!, Number(id));
            setItem(res.data);
        } catch (err) {
            console.error(err);
            router.replace("/affiliate/ambassador/orders");
        }
    };

    if (status === "loading" || !session) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    if (!item) {
        return <div className="p-10 text-center">Loading data...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">

            {/* Page Title */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Ambassador Item Details</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Detailed breakdown of product, commission and order information.
                </p>
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">

                {/* Header Section */}
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-medium text-gray-900">
                            Item #{item.id}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Linked to Order #{item.order.id}
                        </p>
                    </div>

                    <span
                        className={`
                        px-3 py-1.5 rounded-lg text-xs font-semibold
                        ${item.ambassadorPaid
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                    `}
                    >
                        {item.ambassadorPaid ? "Paid" : "Pending"}
                    </span>
                </div>

                {/* Product Section */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Product</h3>

                    <div className="flex items-center gap-5">

                        <div className="w-24 h-24 rounded-lg border bg-gray-50 flex justify-center items-center overflow-hidden">
                            {item.product?.productimage?.[0]?.url ? (
                                <img
                                    src={item.product.productimage[0].url}
                                    alt="Product"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-gray-400 text-xs">No Image</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <p className="text-gray-900 font-medium">{item.product.title}</p>

                            <p className="text-sm text-gray-500">
                                {item.variant?.sku}
                                {item.variant?.color?.name && ` · ${item.variant.color.name}`}
                                {item.variant?.size?.name && ` · ${item.variant.size.name}`}
                            </p>
                        </div>
                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* Item Breakdown */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Item Breakdown</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                        <div>
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="text-gray-900 font-medium mt-1">{item.quantity}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Subtotal</p>
                            <p className="text-gray-900 font-medium mt-1">£{item.subtotal}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Your Commission</p>
                            <p className="text-green-600 font-semibold mt-1">£{item.ambassadorEarning}</p>
                        </div>

                    </div>
                </section>

                <hr className="border-gray-200" />

                {/* Order Info */}
                <section>
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">Order Information</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                        <div>
                            <p className="text-xs text-gray-500">Order ID</p>
                            <p className="text-gray-900 font-medium mt-1">#{item.order.id}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Order Date</p>
                            <p className="text-gray-900 mt-1">
                                {new Date(item.order.createdAt).toLocaleString("en-GB")}
                            </p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Order Total</p>
                            <p className="text-gray-900 mt-1">£{item.order.totalAmount}</p>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500">Customer</p>
                            <p className="text-gray-900 font-medium mt-1">{item.order.user?.name}</p>
                            <p className="text-gray-500 text-sm">{item.order.user?.email}</p>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );

}
