"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { solidarityReceiptService, SolidarityReceipt } from "@/lib/services/solidarityReceiptService";
import { useModalStore } from "@/lib/stores/modalStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { uploadService } from "@/lib/services/uploadService";

interface PopUpInterfaceLocal {
    isOpen: boolean;
    type: string;
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export default function SolidarityReceiptPage() {
    const [receipts, setReceipts] = useState<SolidarityReceipt[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    // ✅ One variable for all form fields
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        amount: "",
        receiptImage: "",
    });

    const { title, description, amount, receiptImage } = formData;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const fileRef = useRef<HTMLInputElement>(null);

    const modalAction = useModalStore((state) => state.action);
    const clearModal = useModalStore((state) => state.clearModal);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterfaceLocal>({
        isOpen: false,
        type: "",
        message: "",
        onConfirm: undefined,
        onCancel: undefined,
    });

    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const router = useRouter();

    /* -------------------------------------
       AUTH GUARD
    ------------------------------------- */
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        else if (status === "authenticated" && session?.user?.role !== "admin")
            router.replace(ROUTES.HOME);
    }, [status, session, router]);

    /* -------------------------------------
       OPEN MODAL VIA GLOBAL STORE
    ------------------------------------- */
    useEffect(() => {
        if (modalAction === "solidarityReceipt") {
            setFormData({
                title: "",
                description: "",
                amount: "",
                receiptImage: "",
            });
            setEditId(null);
            setIsEditing(false);
            setIsModalOpen(true);
            clearModal();
        }
    }, [modalAction, clearModal]);

    /* -------------------------------------
       FETCH RECEIPTS
    ------------------------------------- */
    useEffect(() => {
        if (token) fetchReceipts();
    }, [token]);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const data: any = await solidarityReceiptService.getAll(token!);
            setReceipts(data?.data ?? []);
        } catch (error) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Failed to fetch receipts.",
                onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
            });
        } finally {
            setLoading(false);
        }
    };

    /* -------------------------------------
       FILTER + PAGINATION
    ------------------------------------- */
    const filteredReceipts = useMemo(() => {
        return receipts.filter((r) =>
            r.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [receipts, searchTerm]);

    const totalPages = Math.ceil(filteredReceipts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredReceipts.slice(startIndex, startIndex + pageSize);
    /* -------------------------------------
       ADD / UPDATE RECEIPT (submit)
    ------------------------------------- */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) return;
        if (!formData.amount.toString().trim()) return;

        if (!formData.receiptImage) {
            return setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Receipt image is required.",
                onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
            });
        }

        try {
            const payload = {
                title: formData.title.trim(),
                description: formData.description?.trim() ?? "",
                amount: parseFloat(String(formData.amount)),
                receiptImage: formData.receiptImage, // API expects receiptImage
            };

            if (isEditing && editId) {
                await solidarityReceiptService.update(token!, editId, payload);
                setPopUpAlertData({
                    isOpen: true,
                    type: "success",
                    message: "Receipt updated successfully!",
                    onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                    onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                });
            } else {
                await solidarityReceiptService.create(token!, payload);
                setPopUpAlertData({
                    isOpen: true,
                    type: "success",
                    message: "Receipt added successfully!",
                    onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                    onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                });
            }

            setIsModalOpen(false);
            // reset form
            setFormData({ title: "", description: "", amount: "", receiptImage: "" });
            fetchReceipts();
        } catch (err: any) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to save receipt.",
                onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
            });
        }
    };

    /* -------------------------------------
       IMAGE UPLOAD
    ------------------------------------- */
    const handleImageUpload = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const url = await uploadService.uploadImage(file, "solidarity");
            setFormData(prev => ({ ...prev, receiptImage: url }));
        } catch (err: any) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: err.message || "Image upload failed.",
                onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
            });
        }
    };

    /* -------------------------------------
       EDIT (uses service.getById)
    ------------------------------------- */
    const handleEdit = async (itemOrId: SolidarityReceipt | number) => {
        try {
            // accept either item object or id
            let item: SolidarityReceipt | null = null;
            if (typeof itemOrId === "number") {
                const res: any = await solidarityReceiptService.getById(token!, itemOrId);
                item = res?.data ?? null;
            } else {
                item = itemOrId;
            }

            if (!item) {
                setPopUpAlertData({
                    isOpen: true,
                    type: "error",
                    message: "Failed to load receipt.",
                    onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                    onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                });
                return;
            }

            setFormData({
                title: item.title,
                description: item.description ?? "",
                amount: String(item.amount),
                receiptImage: (item as any).receiptImage ?? (item as any).receiptImage ?? "",
            });

            setEditId(item.id);
            setIsEditing(true);
            setIsModalOpen(true);
        } catch (err: any) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: err.message || "Failed to load receipt.",
                onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
            });
        }
    };

    /* -------------------------------------
       DELETE RECEIPT
    ------------------------------------- */
    const handleDelete = (id: number) => {
        setPopUpAlertData({
            isOpen: true,
            type: "confirm",
            message: "Are you sure you want to delete this receipt?",
            onConfirm: async () => {
                try {
                    await solidarityReceiptService.remove(token!, id);
                    setPopUpAlertData({
                        isOpen: true,
                        type: "success",
                        message: "Receipt deleted successfully!",
                        onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                        onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                    });
                    fetchReceipts();
                } catch (err: any) {
                    setPopUpAlertData({
                        isOpen: true,
                        type: "error",
                        message: err.message || "Failed to delete receipt.",
                        onConfirm: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                        onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
                    });
                }
            },
            onCancel: () => setPopUpAlertData(p => ({ ...p, isOpen: false })),
        });
    };

    if (status === "loading" || loading) return <Loader />;

    /* -------------------------------------
       RENDER - JSX
    ------------------------------------- */
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Solidarity Receipts</h1>

                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search receipts..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
                        />
                    </div>
                </div>

                <div className="border-t border-gray-200" />

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm table-fixed">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                            <tr>
                                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                                <th className="py-3 px-3 text-center w-[100px]">Image</th>
                                <th className="py-3 px-3 text-center">Title</th>
                                <th className="py-3 px-3 text-center">Amount</th>
                                <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((item, idx) => (
                                    <tr key={item.id} className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}>
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>

                                        <td className="py-3 px-3 text-center">
                                            {item.receiptImage ? (
                                                <div className="w-14 h-14 mx-auto flex items-center justify-center">
                                                    <img
                                                        src={item.receiptImage}
                                                        alt={item.title}
                                                        className="w-14 h-14 rounded-md object-cover border"
                                                    />
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No Image</span>
                                            )}
                                        </td>

                                        <td className="py-3 px-3 text-center">{item.title}</td>
                                        <td className="py-3 px-3 text-center">{item.amount}</td>

                                        <td className="py-3 px-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="p-1.5 text-[var(--brand-secondary)] hover:bg-gray-100 rounded-full"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 text-[var(--brand-primary)] hover:bg-gray-100 rounded-full"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-gray-500">
                                        No receipts found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                </div>

                {/* Pagination */}
                {!loading && filteredReceipts.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredReceipts.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
                        <button onClick={() => { setIsModalOpen(false); setFormData({ title: "", description: "", amount: "", receiptImage: "" }); }} className="absolute top-3 right-3 text-gray-500">
                            <X size={20} />
                        </button>

                        <h2 className="text-lg font-semibold mb-4">{isEditing ? "Edit Receipt" : "Add Receipt"}</h2>

                        <form onSubmit={handleSubmit}>
                            <label className="block mb-2 text-sm">Title *</label>
                            <input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} className="w-full border rounded px-3 py-2 mb-4" />

                            <label className="block mb-2 text-sm">Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full border rounded px-3 py-2 mb-4" rows={3} />

                            <label className="block mb-2 text-sm">Amount *</label>
                            <input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} className="w-full border rounded px-3 py-2 mb-4" />

                            <label className="block mb-2 text-sm">Receipt Image *</label>

                            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                            <div onClick={() => fileRef.current?.click()} className="relative w-28 h-28 border rounded-md bg-gray-50 cursor-pointer overflow-hidden mb-4">
                                {!formData.receiptImage ? (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">Upload</div>
                                ) : (
                                    <img src={formData.receiptImage} className="w-full h-full object-cover" />
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => { setIsModalOpen(false); setFormData({ title: "", description: "", amount: "", receiptImage: "" }); }} className="px-4 py-2 border rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[var(--brand-primary)] text-white rounded">{isEditing ? "Update" : "Add"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Alert */}
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
