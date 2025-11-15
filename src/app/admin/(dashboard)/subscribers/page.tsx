"use client";

import { useEffect, useState } from "react";
import { Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
    Menu,
    MenuItem,
    IconButton,
    ListItemIcon,
    ListItemText,
} from "@mui/material";

import { useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { subscriberService } from "@/lib/services/subscriberService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function SubscriberListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const allowedRoles = ["admin"];

    const token = session?.user?.token;

    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    // MUI Menu state
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    //  Protect unauthorized users
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        else if (status === "authenticated" && !allowedRoles.includes(session?.user?.role))
            router.replace(ROUTES.HOME);
    }, [status, session, router]);

    useEffect(() => {
        if (token) fetchSubscribers();
    }, [token]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (token) fetchSubscribers(searchTerm);
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm, token]);

    const fetchSubscribers = async (search?: string) => {
        try {
            setLoading(true);
            const response: any = await subscriberService.getAll(token!, search);

            if (Array.isArray(response)) setSubscribers(response);
            else if (Array.isArray(response?.data)) setSubscribers(response.data);
            else setSubscribers([]);
        } catch (error) {
            console.error("Failed to fetch subscribers:", error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(subscribers.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = subscribers.slice(startIndex, startIndex + pageSize);

    // Open menu (same as Menus Page)
    const openMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
        setMenuAnchor(event.currentTarget);
        setSelectedId(id);
    };

    const closeMenu = () => {
        setMenuAnchor(null);
        setSelectedId(null);
    };

    const handleDelete = (id: number) => {
        setPopUpAlertData({
            isOpen: true,
            type: "confirm",
            message: "Are you sure you want to delete this subscriber?",
            onConfirm: async () => {
                try {
                    await subscriberService.remove(token!, id);
                    setPopUpAlertData({
                        isOpen: true,
                        type: "success",
                        message: "Subscriber deleted successfully!",
                        onConfirm: () =>
                            setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
                    });
                    fetchSubscribers(searchTerm);
                } catch (err: any) {
                    setPopUpAlertData({
                        isOpen: true,
                        type: "error",
                        message: err.message || "Failed to delete subscriber.",
                        onConfirm: () =>
                            setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
                    });
                }
            },
            onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Subscribers</h1>

                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search subscribers..."
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
                                <th className="py-3 px-3 text-center">Email</th>
                                <th className="py-3 px-3 text-center">Name</th>
                                <th className="py-3 px-3 text-center">Phone</th>
                                <th className="py-3 px-3 text-center">Status</th>
                                <th className="py-3 px-3 text-center w-[100px]">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                                        Loading...
                                    </td>
                                </tr>
                            ) : paginatedData.length > 0 ? (
                                paginatedData.map((sub: any, idx) => (
                                    <tr
                                        key={sub.id}
                                        className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                                            } hover:bg-gray-100 transition`}
                                    >
                                        <td className="py-3 px-3 text-center text-gray-600">
                                            {startIndex + idx + 1}
                                        </td>

                                        <td className="py-3 px-3 text-center font-medium text-gray-800">
                                            {sub.email}
                                        </td>

                                        <td className="py-3 px-3 text-center text-gray-700">
                                            {sub.name || "-"}
                                        </td>

                                        <td className="py-3 px-3 text-center text-gray-700">
                                            {sub.phone || "-"}
                                        </td>

                                        <td className="py-3 px-3 text-center">
                                            {sub.isActive ? (
                                                <span className="text-green-600 font-semibold">Active</span>
                                            ) : (
                                                <span className="text-red-500 font-semibold">Inactive</span>
                                            )}
                                        </td>

                                        {/* ACTION COLUMN - Using same MUI Menu as Menus Page */}
                                        <td className="py-3 px-3 text-center">
                                            <IconButton onClick={(e) => openMenu(e, sub.id)}>
                                                <MoreVertical size={18} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                                        No subscribers found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {subscribers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={subscribers.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>

            {/* ⋮ MENU — same style as Menus page */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
                <MenuItem
                    onClick={() => {
                        router.push(`/admin/subscribers/form/${selectedId}`);
                        closeMenu();
                    }}
                >
                    <ListItemIcon>
                        <Pencil size={18} color="var(--brand-secondary)" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        if (selectedId) handleDelete(selectedId);
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
