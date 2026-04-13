"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, X, Search, HelpingHand, DollarSign, FileImage } from "lucide-react";
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
    isOpen: boolean; type: string; message: string;
    onConfirm?: () => void; onCancel?: () => void;
}

export default function SolidarityReceiptPage() {
    const [receipts, setReceipts] = useState<SolidarityReceipt[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: "", description: "", amount: "", receiptImage: "" });
    const { title, description, amount, receiptImage } = formData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const modalAction = useModalStore((state) => state.action);
    const clearModal = useModalStore((state) => state.clearModal);
    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterfaceLocal>({ isOpen: false, type: "", message: "", onConfirm: undefined, onCancel: undefined });
    const { data: session, status } = useSession();
    const token = session?.user?.token;
    const router = useRouter();

    const closeAlert = () => setPopUpAlertData(p => ({ ...p, isOpen: false }));

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        else if (status === "authenticated" && session?.user?.role !== "admin") router.replace(ROUTES.HOME);
    }, [status, session, router]);

    useEffect(() => {
        if (modalAction === "solidarityReceipt") {
            setFormData({ title: "", description: "", amount: "", receiptImage: "" });
            setEditId(null); setIsEditing(false); setIsModalOpen(true); clearModal();
        }
    }, [modalAction, clearModal]);

    useEffect(() => { if (token) fetchReceipts(); }, [token]);

    const fetchReceipts = async () => {
        try {
            setLoading(true);
            const data: any = await solidarityReceiptService.getAll(token!);
            setReceipts(data?.data ?? []);
        } catch (error) {
            setPopUpAlertData({ isOpen: true, type: "error", message: "Failed to fetch receipts.", onConfirm: closeAlert, onCancel: closeAlert });
        } finally { setLoading(false); }
    };

    const filteredReceipts = useMemo(() =>
        receipts.filter((r) => r.title.toLowerCase().includes(searchTerm.toLowerCase())), [receipts, searchTerm]);

    const totalPages = Math.ceil(filteredReceipts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filteredReceipts.slice(startIndex, startIndex + pageSize);

    const totalAmount = receipts.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.amount.toString().trim()) return;
        if (!formData.receiptImage) {
            setPopUpAlertData({ isOpen: true, type: "error", message: "Receipt image is required.", onConfirm: closeAlert, onCancel: closeAlert }); return;
        }
        try {
            const payload = { title: formData.title.trim(), description: formData.description?.trim() ?? "", amount: parseFloat(String(formData.amount)), receiptImage: formData.receiptImage };
            if (isEditing && editId) {
                await solidarityReceiptService.update(token!, editId, payload);
                setPopUpAlertData({ isOpen: true, type: "success", message: "Receipt updated successfully!", onConfirm: closeAlert, onCancel: closeAlert });
            } else {
                await solidarityReceiptService.create(token!, payload);
                setPopUpAlertData({ isOpen: true, type: "success", message: "Receipt added successfully!", onConfirm: closeAlert, onCancel: closeAlert });
            }
            setIsModalOpen(false); setFormData({ title: "", description: "", amount: "", receiptImage: "" }); fetchReceipts();
        } catch (err: any) {
            setPopUpAlertData({ isOpen: true, type: "error", message: err.message || "Failed to save receipt.", onConfirm: closeAlert, onCancel: closeAlert });
        }
    };

    const handleImageUpload = async (e: any) => {
        const file = e.target.files?.[0]; if (!file) return;
        try {
            const url = await uploadService.uploadImage(file, "solidarity");
            setFormData(prev => ({ ...prev, receiptImage: url }));
        } catch (err: any) {
            setPopUpAlertData({ isOpen: true, type: "error", message: err.message || "Image upload failed.", onConfirm: closeAlert, onCancel: closeAlert });
        }
    };

    const handleEdit = async (itemOrId: SolidarityReceipt | number) => {
        try {
            let item: SolidarityReceipt | null = null;
            if (typeof itemOrId === "number") { const res: any = await solidarityReceiptService.getById(token!, itemOrId); item = res?.data ?? null; }
            else { item = itemOrId; }
            if (!item) { setPopUpAlertData({ isOpen: true, type: "error", message: "Failed to load receipt.", onConfirm: closeAlert, onCancel: closeAlert }); return; }
            setFormData({ title: item.title, description: item.description ?? "", amount: String(item.amount), receiptImage: (item as any).receiptImage ?? "" });
            setEditId(item.id); setIsEditing(true); setIsModalOpen(true);
        } catch (err: any) {
            setPopUpAlertData({ isOpen: true, type: "error", message: err.message || "Failed to load receipt.", onConfirm: closeAlert, onCancel: closeAlert });
        }
    };

    const handleDelete = (id: number) => {
        setPopUpAlertData({
            isOpen: true, type: "confirm", message: "Are you sure you want to delete this receipt?",
            onConfirm: async () => {
                try {
                    await solidarityReceiptService.remove(token!, id);
                    setPopUpAlertData({ isOpen: true, type: "success", message: "Receipt deleted!", onConfirm: closeAlert, onCancel: closeAlert });
                    fetchReceipts();
                } catch (err: any) {
                    setPopUpAlertData({ isOpen: true, type: "error", message: err.message || "Failed to delete.", onConfirm: closeAlert, onCancel: closeAlert });
                }
            },
            onCancel: closeAlert,
        });
    };

    if (status === "loading" || loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-[#1E2A4A] text-white p-8 rounded-b-[2rem] shadow-lg mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Solidarity Receipts</h1>
                            <p className="text-blue-200">Manage and publish solidarity receipts and proof of donations.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-teal-500/20 rounded-xl text-teal-300"><HelpingHand size={24} /></div>
                                <div><p className="text-sm text-blue-200">Total Receipts</p><h3 className="text-2xl font-bold">{receipts.length}</h3></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-300"><DollarSign size={24} /></div>
                                <div><p className="text-sm text-green-200">Total Amount</p><h3 className="text-2xl font-bold">£{totalAmount.toFixed(2)}</h3></div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300"><FileImage size={24} /></div>
                                <div><p className="text-sm text-blue-200">Filtered Results</p><h3 className="text-2xl font-bold">{filteredReceipts.length}</h3></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Search */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search receipts by title..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Sn.</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Image</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginated.length > 0 ? (
                                    paginated.map((item, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 text-gray-500">{startIndex + idx + 1}</td>
                                            <td className="px-6 py-5">
                                                {item.receiptImage ? (
                                                    <img src={item.receiptImage} alt={item.title} className="w-14 h-14 rounded-xl object-cover border border-gray-100 shadow-sm" />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-xs">No img</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="font-semibold text-gray-900">{item.title}</p>
                                                {item.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>}
                                            </td>
                                            <td className="px-6 py-5 font-bold text-green-600">£{Number(item.amount).toFixed(2)}</td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEdit(item.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Edit">
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition" title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={5} className="py-14 text-center text-gray-400 italic">No receipts found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {!loading && filteredReceipts.length > 0 && (
                        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredReceipts.length}
                            pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => { setIsModalOpen(false); setFormData({ title: "", description: "", amount: "", receiptImage: "" }); }} />
                    <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="bg-[#1E2A4A] p-6 text-white text-center">
                            <h3 className="text-xl font-bold">{isEditing ? "Edit Receipt" : "Add New Receipt"}</h3>
                            <p className="text-blue-200 text-sm mt-1">Solidarity receipt details</p>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title *</label>
                                    <input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</label>
                                    <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Amount *</label>
                                    <input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))}
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Receipt Image *</label>
                                    <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleImageUpload} className="hidden" />
                                    <div onClick={() => fileRef.current?.click()}
                                        className="w-28 h-28 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 cursor-pointer overflow-hidden hover:border-blue-400 transition-colors flex items-center justify-center">
                                        {!formData.receiptImage ? (
                                            <div className="text-center text-gray-400"><FileImage size={24} className="mx-auto mb-1" /><p className="text-xs">Upload</p></div>
                                        ) : (
                                            <img src={formData.receiptImage} className="w-full h-full object-cover" />
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setIsModalOpen(false); setFormData({ title: "", description: "", amount: "", receiptImage: "" }); }}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">Cancel</button>
                                    <button type="submit"
                                        className="flex-1 py-3 bg-[#1E2A4A] text-white rounded-xl font-bold hover:bg-blue-800 transition">
                                        {isEditing ? "Update" : "Add Receipt"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <PopupAlert type={popUpAlertData.type as any} message={popUpAlertData.message}
                confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
                cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
                onConfirm={popUpAlertData.onConfirm} onCancel={popUpAlertData.onCancel}
                show={popUpAlertData.isOpen} />
        </div>
    );
}
