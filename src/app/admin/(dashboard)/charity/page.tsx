"use client";

import { useEffect, useState } from "react";
import { Search, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import { charityService } from "@/lib/services/charityService";
import { GBP } from "@/lib/utils";

export default function CharityListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const allowedRoles = ["admin"];

    const token = session?.user?.token;

    const [donations, setDonations] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    // Redirect unauthorized users
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (status === "authenticated" && !allowedRoles.includes(session?.user?.role)) {
            router.replace(ROUTES.HOME);
        }
    }, [status, session, router]);

    useEffect(() => {
        if (token) fetchDonations();
    }, [token]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (token) fetchDonations(searchTerm);
        }, 350);
        return () => clearTimeout(timeout);
    }, [searchTerm, token]);

    const fetchDonations = async (search?: string) => {
        try {
            setLoading(true);

            const response: any = await charityService.getAll(token!, search);

            let list = Array.isArray(response?.donations)
                ? response.donations
                : Array.isArray(response)
                    ? response
                    : [];

            setDonations(list);
        } catch (error) {
            console.error("Failed to fetch charity donations:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(donations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = donations.slice(startIndex, startIndex + pageSize);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Charity Donations</h1>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search donations..."
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
                                <th className="py-3 px-3 text-center w-[140px]">Donor</th>
                                <th className="py-3 px-3 text-center">Email</th>
                                <th className="py-3 px-3 text-center">Amount</th>
                                <th className="py-3 px-3 text-center">Order</th>
                                <th className="py-3 px-3 text-center">Status</th>
                                <th className="py-3 px-3 text-center">Date</th>
                                <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((item: any, idx) => (
                                    <tr
                                        key={item.id}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                                    >
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>

                                        <td className="py-3 px-3 text-center font-medium">
                                            {item.anonymous ? "Anonymous" : item.name || "—"}
                                        </td>

                                        <td className="py-3 px-3 text-center">{item.email}</td>

                                        <td className="py-3 px-3 text-center text-green-600 font-semibold">
                                            {GBP.format(item.amount)}

                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            {item.orderId ? `#${item.orderId}` : "—"}
                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${item.paymentStatus === "completed"
                                                    ? "bg-green-100 text-green-700"
                                                    : item.paymentStatus === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.paymentStatus}
                                            </span>
                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            <button
                                                onClick={() => router.push(`/admin/charity/${item.id}`)}
                                                className="p-1.5 text-[var(--brand-secondary)] hover:bg-gray-100 rounded-full"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="py-12 text-center text-gray-500">
                                        No donations found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {donations.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={donations.length}
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
                cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
                onConfirm={popUpAlertData.onConfirm}
                onCancel={popUpAlertData.onCancel}
                show={popUpAlertData.isOpen}
            />
        </div>
    );
}
