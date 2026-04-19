"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreVertical, Pencil, Trash2, Search } from "lucide-react";
import TextField from "@mui/material/TextField";
import {
    Menu,
    MenuItem,
    IconButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { faqService, Faq } from "@/lib/services/faqService";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function FaqListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedFaqId, setSelectedFaqId] = useState<number | null>(null);

    //  Redirect unauthorized users
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (status === "authenticated" && session?.user?.role !== "admin") {
            router.replace(ROUTES.HOME);
        }
    }, [status, session, router]);

    //  Fetch FAQs
    useEffect(() => {
        if (session?.user?.token) fetchFaqs();
    }, [session?.user?.token]);

    const fetchFaqs = async () => {
        try {
            setLoading(true);
            const data: any = await faqService.getAll(session?.user?.token as string);
            setFaqs(data?.data ?? []);
        } catch {
            showAlert("error", "Failed to fetch FAQs.");
        } finally {
            setLoading(false);
        }
    };

    //  Filter + Paginate
    const filteredFaqs = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return faqs.filter(
            (faq) =>
                faq.question.toLowerCase().includes(term) ||
                faq.answer.toLowerCase().includes(term)
        );
    }, [faqs, searchTerm]);

    const totalPages = Math.ceil(filteredFaqs.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedFaqs = filteredFaqs.slice(startIndex, startIndex + pageSize);

    //  Delete FAQ
    const handleDelete = (id: number) => {
        setPopUpAlertData({
            isOpen: true,
            type: "confirm",
            message: "Are you sure you want to delete this FAQ?",
            onConfirm: async () => {
                try {
                    await faqService.remove(session?.user?.token as string, id);
                    showAlert("success", "FAQ deleted successfully!");
                    fetchFaqs();
                } catch (err: any) {
                    showAlert("error", err.message || "Failed to delete FAQ.");
                }
            },
            onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
        });
    };

    const showAlert = (type: "success" | "error", message: string) => {
        setPopUpAlertData({
            isOpen: true,
            type,
            message,
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
        });
    };

    const openMenu = (event: React.MouseEvent<HTMLElement>, faqId: number) => {
        setMenuAnchor(event.currentTarget);
        setSelectedFaqId(faqId);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setSelectedFaqId(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                {/*  Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Manage FAQs</h1>


                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search FAQ..."
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

                {/*  Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                            <tr>
                                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                                <th className="py-3 px-3 text-center">Question</th>
                                <th className="py-3 px-3 text-center">Answer</th>
                                <th className="py-3 px-3 text-center">Category</th>
                                <th className="py-3 px-3 text-center">Created</th>
                                <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                                        Loading FAQs...
                                    </td>
                                </tr>
                            ) : paginatedFaqs.length > 0 ? (
                                paginatedFaqs.map((faq, idx) => (
                                    <tr
                                        key={faq.id}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-gray-100 transition`}
                                    >
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
                                        <td className="py-3 px-3 text-center">{faq.question}</td>
                                        <td className="py-3 px-3 text-center text-gray-600 line-clamp-2">
                                            <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                        </td>
                                        <td className="py-3 px-3 text-center">{faq.category?.name ?? "-"}</td>
                                        <td className="py-3 px-3 text-center">
                                            {new Date(faq.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <IconButton onClick={(e) => openMenu(e, faq.id)}>
                                                <MoreVertical size={18} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                                        No FAQs found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredFaqs.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredFaqs.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>

            {/* ⋮ Menu */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem
                    onClick={() => {
                        router.push("/admin/faqs/form/" + selectedFaqId);
                    }}
                >
                    <ListItemIcon>
                        <Pencil size={18} color="var(--brand-secondary)" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        if (selectedFaqId) handleDelete(selectedFaqId);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <Trash2 size={18} color="var(--brand-primary)" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>

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
