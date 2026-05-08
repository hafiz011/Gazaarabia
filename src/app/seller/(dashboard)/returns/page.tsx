"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Eye } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import Loader from "@/components/Loader";
import SellerLoader from "@/components/seller/SellerLoader";
import { returnRequestSellerService } from "@/lib/services/seller/returnRequestService";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { PopUpInterface } from "@/lib/types";

export default function ReturnRequestListPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
        onConfirm: undefined,
        onCancel: undefined,
    });
    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const router = useRouter();

    //  Auth Guard
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.SELLER.LOGIN);
        else if (session?.user?.role !== "seller") router.replace(ROUTES.HOME);
    }, [status, session, router]);

    //  Fetch Requests
    useEffect(() => {
        if (token) fetchRequests();
    }, [token, currentPage, pageSize]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await returnRequestSellerService.getAll(token!, currentPage, pageSize);
            if (res.success) {
                setRequests(res.data);
                setTotalCount(res.total || 0);
            }
        } catch {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Failed to load return requests.",
                onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
            });
        } finally {
            setLoading(false);
        }
    };

    //  Filter Rows (Still useful for simple search, but ideally move to server)
    const filtered = useMemo(() => {
        if (!searchTerm) return requests;
        return requests.filter((r) =>
            r.orderItem.product.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [requests, searchTerm]);

    //  Pagination Calculations
    const totalPages = Math.ceil(totalCount / pageSize);
    const paginated = filtered; // Data is already paginated from server
    const startIndex = (currentPage - 1) * pageSize;

    if (status === "loading" || loading) return <SellerLoader />;

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6">
                    <h1 className="text-xl font-bold text-gray-900">Return Requests</h1>

                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by product..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-200 bg-gray-50 rounded-full pl-10 pr-4 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all"
                        />
                    </div>
                </div>

                <div className="border-t"></div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] whitespace-nowrap text-sm">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                            <tr>
                                <th className="py-3 px-3 text-center">Sn.</th>
                                <th className="py-3 px-3 text-left">Product</th>
                                <th className="py-3 px-3 text-center">Reason</th>
                                <th className="py-3 px-3 text-center">Customer</th>
                                <th className="py-3 px-3 text-center">Status</th>
                                <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((req, idx) => (
                                    <tr key={req.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>

                                        <td className="py-3 px-3">{req.orderItem.product.title}</td>

                                        <td className="py-3 px-3 text-center">{req.reason.label}</td>

                                        <td className="py-3 px-3 text-center">{req.user.name}</td>

                                        <td className="py-3 px-3 text-center capitalize">
                                            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700">
                                                {req.status}
                                            </span>
                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => router.push(`/admin/returns/${req.id}`)}
                                                className="p-1.5 text-[var(--brand-primary)] hover:bg-gray-100 rounded-full"
                                                title="View Details"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-10 text-center text-gray-500">
                                        No return requests found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalCount}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>


            {/* Popup Alert */}
            <PopupAlert
                type={popUpAlertData.type as any}
                message={popUpAlertData.message}
                confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
                cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
                onConfirm={popUpAlertData.onConfirm}
                onCancel={popUpAlertData.onCancel}
                show={popUpAlertData.isOpen}
            />
        </div>
    );
}
