"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { ambassadorOrderService } from "@/lib/services/ambassadorOrderService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function AmbassadorOrderItemsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const token = session?.user?.token;
    const affiliateType = session?.user?.affiliateType;

    const [items, setItems] = useState<any[]>([]);
    const [displayedItems, setDisplayedItems] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);




    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    // Role guard — only ambassadors allowed
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace(ROUTES.AFFILIATE.LOGIN);
            return;
        }

        if (session?.user?.role !== "affiliate" || affiliateType !== "ambassador") {
            router.replace(ROUTES.HOME);
            return;
        }
    }, [status, session, router]);


    // Load once
    useEffect(() => {
        if (token) fetchItems();
    }, [token]);

    // Frontend search only — DO NOT call API
    useEffect(() => {
        setCurrentPage(1);

        if (!searchTerm.trim()) {
            // reset to full data
            setDisplayedItems(items);
            return;
        }

        const s = searchTerm.toLowerCase();

        const filtered = items.filter((item: any) =>
            item.product?.title?.toLowerCase().includes(s) ||
            item.variant?.sku?.toLowerCase().includes(s) ||
            item.order?.id?.toString().includes(s)
        );

        setDisplayedItems(filtered);
    }, [searchTerm, items]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const response: any = await ambassadorOrderService.getAll(token!);

            const data = response?.data || [];

            setItems(data);
            setDisplayedItems(data); // initial load
        } catch (error) {
            console.error("Failed to fetch:", error);
        } finally {
            setLoading(false);
        }
    };



    const startIndex = (currentPage - 1) * pageSize;
    const totalPages = Math.ceil(displayedItems.length / pageSize);
    const paginatedData = displayedItems.slice(startIndex, startIndex + pageSize);


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Ambassador Order Items
                    </h1>

                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                        focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                            <tr>
                                <th className="py-3 px-3 text-center w-[50px]">Sn.</th>
                                <th className="py-3 px-3 text-left">Product</th>
                                <th className="py-3 px-3 text-left">Variant</th>
                                <th className="py-3 px-3 text-center">Qty</th>
                                <th className="py-3 px-3 text-right">Subtotal</th>
                                <th className="py-3 px-3 text-right">Commission</th>
                                <th className="py-3 px-3 text-center">Paid</th>
                                <th className="py-3 px-3 text-center">Order</th>
                                <th className="py-3 px-3 text-center w-[80px]">Action</th>

                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                                        Loading...
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item: any, idx: number) => (
                                    <tr
                                        key={item.id}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                                    >
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
                                        <td className="py-3 px-3">{item.product?.title}</td>

                                        <td className="py-3 px-3">
                                            {item.variant?.sku}
                                            {item.variant?.color?.name && (
                                                <span className="text-gray-500"> / {item.variant.color.name}</span>
                                            )}
                                            {item.variant?.size?.name && (
                                                <span className="text-gray-500"> / {item.variant.size.name}</span>
                                            )}
                                        </td>

                                        <td className="py-3 px-3 text-center">{item.quantity}</td>
                                        <td className="py-3 px-3 text-right">£{item.subtotal}</td>

                                        <td className="py-3 px-3 text-right text-green-600 font-semibold">
                                            £{item.ambassadorEarning ?? 0}
                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            {item.ambassadorPaid ? (
                                                <CheckCircle size={20} className="text-green-600 mx-auto" />
                                            ) : (
                                                <XCircle size={20} className="text-red-500 mx-auto" />
                                            )}
                                        </td>

                                        <td className="py-3 px-3 text-center text-gray-800 font-medium">
                                            #{item.order.id}
                                        </td>

                                        {/* Action Column */}
                                        <td className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => router.push(`/affiliate/ambassador/orders/${item.id}`)}
                                                className="p-2 rounded-full text-[var(--brand-secondary)] hover:bg-gray-100 transition"
                                                title="View Details"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M2.25 12s3.75-7.5 9.75-7.5 9.75 7.5 9.75 7.5-3.75 7.5-9.75 7.5S2.25 12 2.25 12z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z"
                                                    />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>

                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500">
                                        No ambassador order items found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {items.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={items.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>

            <PopupAlert
                type={popUpAlertData.type as any}
                message={popUpAlertData.message}
                confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
                cancelText={undefined}
                onConfirm={popUpAlertData.onConfirm}
                onCancel={popUpAlertData.onCancel}
                show={popUpAlertData.isOpen}
            />
        </div>
    );
}
