"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import Loader from "@/components/Loader";
import { returnReasonService } from "@/lib/services/returnReasonService";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { useModalStore } from "@/lib/stores/modalStore";

export default function ReturnReasonListPage() {
    const [reasons, setReasons] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    const [label, setLabel] = useState("");
    const [requireImage, setRequireImage] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [popUpAlertData, setPopUpAlertData] = useState<any>({
        isOpen: false, type: "", message: "", onConfirm: undefined, onCancel: undefined
    });

    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const router = useRouter();


    const modalAction = useModalStore((state) => state.action);
    const clearModal = useModalStore((state) => state.clearModal);

    // Auth guard
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        else if (status === "authenticated" && session?.user?.role !== "admin")
            router.replace(ROUTES.HOME);
    }, [status, session, router]);

    useEffect(() => {
        if (token) fetchReasons();
    }, [token]);

    const fetchReasons = async () => {
        try {
            setLoading(true);
            const res: any = await returnReasonService.getAll(token!);
            setReasons(res?.data ?? []);
        } catch {
            setPopUpAlertData({
                isOpen: true, type: "error", message: "Failed to fetch return reasons.",
                onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false }))
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredReasons = useMemo(() => {
        return reasons.filter((item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [reasons, searchTerm]);

    const totalPages = Math.ceil(filteredReasons.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedReasons = filteredReasons.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (modalAction === "returnReason") {
            setLabel("");
            setRequireImage(false);
            setEditId(null);
            setIsEditing(false);
            setIsModalOpen(true);
            clearModal();
        }
    }, [modalAction, clearModal]);

    const handleEdit = (reason: any) => {
        setLabel(reason.label);
        setRequireImage(reason.requireImage);
        setEditId(reason.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!label.trim()) return;

        try {
            if (isEditing && editId) {
                await returnReasonService.update(token!, editId, { label, requireImage });
                setPopUpAlertData({
                    isOpen: true, type: "success", message: "Reason updated successfully!",
                    onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
                });
            } else {
                await returnReasonService.create(token!, { label, requireImage });
                setPopUpAlertData({
                    isOpen: true, type: "success", message: "Reason added successfully!",
                    onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
                });
            }
            setIsModalOpen(false);
            fetchReasons();
        } catch (err: any) {
            setPopUpAlertData({
                isOpen: true, type: "error", message: err.message || "Failed to save reason.",
                onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
            });
        }
    };

    const handleDelete = (id: number) => {
        setPopUpAlertData({
            isOpen: true,
            type: "confirm",
            message: "Are you sure you want to delete this reason?",
            onConfirm: async () => {
                try {
                    await returnReasonService.remove(token!, id);
                    fetchReasons();
                    setPopUpAlertData({
                        isOpen: true, type: "success", message: "Reason deleted successfully!",
                        onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
                    });
                } catch (err: any) {
                    setPopUpAlertData({
                        isOpen: true, type: "error", message: err.message,
                        onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
                    });
                }
            },
            onCancel: () => setPopUpAlertData((prev: any) => ({
                ...prev, isOpen: false,
                onConfirm: () => setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
            }))
        });
    };

    if (status === "loading" || loading) return <Loader />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

                {/* Header with Add + Search */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Manage Return Reasons</h1>

                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search return reasons..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                            <tr>
                                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                                <th className="py-3 px-3 text-left">Reason</th>
                                <th className="py-3 px-3 text-center">Require Image</th>
                                <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedReasons.length > 0 ? (
                                paginatedReasons.map((reason, idx) => (
                                    <tr key={reason.id} className={idx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
                                        <td className="py-3 px-3">{reason.label}</td>
                                        <td className="py-3 px-3 text-center">{reason.requireImage ? "Yes" : "No"}</td>
                                        <td className="py-3 px-3 text-center flex justify-center gap-2">
                                            <button onClick={() => handleEdit(reason)} className="text-blue-600 hover:text-blue-800">
                                                <Pencil size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(reason.id)} className="text-red-600 hover:text-red-800">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="py-8 text-center text-gray-500">No return reasons found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredReasons.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
                        <button onClick={() => setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-500">
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Reason" : "Add Reason"}</h2>

                        <form onSubmit={handleSubmit}>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Reason Label <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="w-full border rounded px-3 py-2 mb-4"
                                placeholder="e.g., Wrong Size"
                            />

                            <label className="flex items-center gap-2 text-sm mb-4">
                                <input type="checkbox" checked={requireImage} onChange={(e) => setRequireImage(e.target.checked)} />
                                Require customer to upload image
                            </label>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded border">
                                    Cancel
                                </button>
                                <button type="submit" className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)]">
                                    {isEditing ? "Update" : "Add"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
