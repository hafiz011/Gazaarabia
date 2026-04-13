"use client";

import { useState, useEffect, useCallback } from "react";
import { MoreVertical, Search, CheckCircle, XCircle, Eye } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";

interface Seller {
    id: number;
    shopName: string;
    status: string;
    createdAt: string;
    commissionValue: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
    };
    _count: {
        products: number;
        orderItems: number;
    };
    showMenu?: boolean;
}

export default function SellerListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [sellers, setSellers] = useState<Seller[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");
    const [loading, setLoading] = useState(true);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    const token = session?.user?.token;

    // Redirect if not logged in or not admin
    useEffect(() => {
        if (status === "loading") return;

        console.log("Admin Seller List - Session Role:", session?.user?.role);

        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (status === "authenticated" && session?.user?.role?.toLowerCase() !== "admin") {
            router.replace(ROUTES.HOME);
        }
    }, [status, session, router]);

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Fetch sellers
    const fetchSellers = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: pageSize.toString(),
            });
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (statusFilter) params.append("status", statusFilter);

            const response = await fetch(`/api/seller?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setSellers(data.data.map((s: Seller) => ({ ...s, showMenu: false })));
                setTotalItems(data.meta.total);
                setTotalPages(data.meta.totalPages);
            } else {
                setPopUpAlertData({
                    isOpen: true,
                    type: "error",
                    message: data.message || "Failed to fetch sellers.",
                    onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
                });
            }
        } catch (error) {
            console.error("Error fetching sellers:", error);
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Network error occurred while fetching sellers.",
                onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
            });
        } finally {
            setLoading(false);
        }
    }, [token, currentPage, pageSize, debouncedSearch, statusFilter]);

    useEffect(() => {
        if (status === "authenticated" && session?.user?.role === "admin") {
            fetchSellers();
        }
    }, [fetchSellers, status, session]);

    const toggleMenu = (id: number) => {
        setSellers((prev) =>
            prev.map((seller) =>
                seller.id === id
                    ? { ...seller, showMenu: !seller.showMenu }
                    : { ...seller, showMenu: false }
            )
        );
    };

    const updateSellerStatus = async (id: number, newStatus: string) => {
        try {
            const response = await fetch(`/api/seller/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await response.json();
            if (data.success) {
                setPopUpAlertData({
                    isOpen: true,
                    type: "success",
                    message: data.message || "Seller status updated successfully.",
                    onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
                });
                fetchSellers();
            } else {
                setPopUpAlertData({
                    isOpen: true,
                    type: "error",
                    message: data.message || "Failed to update seller status.",
                    onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
                });
            }
        } catch (error) {
            console.error("Error updating seller status:", error);
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Network error occurred while updating seller status.",
                onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
            });
        }
    };

    const handleStatusChange = (id: number, newStatus: string) => {
        setPopUpAlertData({
            isOpen: true,
            type: "confirm",
            message: `Are you sure you want to change the status to ${newStatus}?`,
            onConfirm: () => {
                setPopUpAlertData((prev) => ({ ...prev, isOpen: false }));
                updateSellerStatus(id, newStatus);
            },
            onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
    };

    if (status === "loading") return <Loader />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-[var(--soft-gray)] overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-[var(--text-primary)]">Manage Sellers</h1>
                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sellers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
                        />
                    </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 p-4 mb-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="h-10 border border-gray-300 rounded-lg px-3 text-sm w-full sm:w-48 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                        </select>

                        <button
                            onClick={() => {
                                setStatusFilter("");
                                setSearchTerm("");
                                setDebouncedSearch("");
                                setCurrentPage(1);
                            }}
                            className="h-10 px-4 border rounded-lg text-sm hover:bg-gray-100"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className="border-t border-[var(--soft-gray)]"></div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <Loader />
                        </div>
                    ) : (
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                                <tr>
                                    <th className="py-3 px-5 text-left w-[70px]">Sn.</th>
                                    <th className="py-3 px-5 text-left">Shop Name</th>
                                    <th className="py-3 px-5 text-left">Seller</th>
                                    <th className="py-3 px-5 text-left">Stats</th>
                                    <th className="py-3 px-5 text-left">Status</th>
                                    <th className="py-3 px-5 text-left">Joined</th>
                                    <th className="py-3 px-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.length > 0 ? (
                                    sellers.map((seller, idx) => (
                                        <tr
                                            key={seller.id}
                                            className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                                } hover:bg-gray-100 transition`}
                                        >
                                            <td className="py-3 px-5 text-gray-600">
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="py-3 px-5 font-medium text-[var(--text-primary)]">
                                                {seller.shopName}
                                            </td>
                                            <td className="py-3 px-5 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{seller.user?.name}</span>
                                                    <span className="text-xs text-gray-500">{seller.user?.email}</span>
                                                    {seller.user?.phone && (
                                                        <span className="text-xs text-gray-500">{seller.user.phone}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="text-xs">Products: {seller._count?.products || 0}</span>
                                                    <span className="text-xs">Orders: {seller._count?.orderItems || 0}</span>
                                                    {seller.commissionValue && (
                                                        <span className="text-xs text-blue-600">Comm: {seller.commissionValue}%</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-5">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${seller.status === "active"
                                                        ? "bg-green-100 text-green-700"
                                                        : seller.status === "pending"
                                                            ? "bg-yellow-100 text-yellow-700"
                                                            : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {seller.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-5 text-gray-600">
                                                {new Date(seller.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-5 text-right relative">
                                                <div className="inline-block text-left">
                                                    <button
                                                        onClick={() => toggleMenu(seller.id)}
                                                        className="p-2 rounded-full hover:bg-gray-200 transition"
                                                    >
                                                        <MoreVertical size={20} className="text-gray-600" />
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    {seller.showMenu && (
                                                        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-50 py-1">
                                                            <button
                                                                onClick={() => {
                                                                    const path = `${ROUTES.ADMIN.SELLER}/${seller.id}`;
                                                                    console.log("Navigating to:", path);
                                                                    router.push(path);
                                                                }}
                                                                className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-gray-100 w-full text-left"
                                                            >
                                                                <Eye size={16} />
                                                                View Details
                                                            </button>
                                                            {seller.status !== "active" && (
                                                                <button
                                                                    onClick={() => handleStatusChange(seller.id, "active")}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                    <CheckCircle size={16} />
                                                                    Approve
                                                                </button>
                                                            )}
                                                            {seller.status !== "suspended" && (
                                                                <button
                                                                    onClick={() => handleStatusChange(seller.id, "suspended")}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                                                                >
                                                                    <XCircle size={16} />
                                                                    Suspend
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="py-12 text-center text-gray-500 text-sm"
                                        >
                                            No sellers found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {!loading && sellers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>

            {/* Confirmation Popup */}
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
