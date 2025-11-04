"use client";

import { useEffect, useState, useMemo } from "react";
import { MoreVertical, Trash2, Search, CheckCircle, XCircle, Pencil } from "lucide-react";
import TextField from "@mui/material/TextField";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { couponService } from "@/lib/services/couponService";
import { Menu, MenuItem, IconButton, ListItemIcon, ListItemText } from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function CouponListPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [coupons, setCoupons] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [popUpAlertData, setPopUpAlertData] = useState<any>({
        isOpen: false,
        type: "",
        message: "",
    });

    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    //  Auth check
    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
        else if (status === "authenticated" && session?.user?.role !== "affiliate" && session?.user?.role !== "admin")
            router.replace(ROUTES.HOME);
    }, [status, session, router]);

    useEffect(() => {
        if (session?.user?.token) fetchCoupons();
    }, [session?.user?.token]);

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const res: any = await couponService.getAllCoupons(session?.user?.token as string);
            setCoupons(res.data ?? []);
        } catch {
            showAlert("error", "Failed to load coupons.");
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return coupons.filter(
            (c) =>
                c.code.toLowerCase().includes(term) ||
                c.discountType.toLowerCase().includes(term) ||
                (c.creator?.name?.toLowerCase().includes(term) ?? false)
        );
    }, [coupons, searchTerm]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    const handleDelete = (id: number) => {
        setPopUpAlertData({
            isOpen: true,
            type: "confirm",
            message: "Are you sure you want to delete this coupon?",
            onConfirm: async () => {
                try {
                    await couponService.deleteCoupon(session?.user?.token as string, id);
                    showAlert("success", "Coupon deleted successfully!");
                    fetchCoupons();
                } catch (err: any) {
                    showAlert("error", err.message || "Failed to delete coupon.");
                }
            },
            onCancel: () => setPopUpAlertData((p: any) => ({ ...p, isOpen: false })),
        });
    };

    const handleEdit = (id: number) => {
        const basePath =
            session?.user?.role === "affiliate"
                ? "/affiliate/coupons/form"
                : "/admin/coupons/form";
        router.push(`${basePath}/${id}`);
    };


    const showAlert = (type: "success" | "error", message: string) => {
        setPopUpAlertData({
            isOpen: true,
            type,
            message,
            onConfirm: () => setPopUpAlertData((p: any) => ({ ...p, isOpen: false })),
        });
    };

    const openMenu = (e: any, id: number) => {
        setMenuAnchor(e.currentTarget);
        setSelectedId(id);
    };
    const closeMenu = () => {
        setMenuAnchor(null);
        setSelectedId(null);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                    <h1 className="text-xl font-semibold text-gray-800">Manage Coupons</h1>
                    <div className="relative w-full sm:w-72" suppressHydrationWarning>
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <TextField
                            required
                            fullWidth
                            size="small"
                            placeholder="Search coupons..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            InputProps={{ sx: { pl: 4 } }}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                                    borderColor: "var(--brand-secondary)", //  use brand-secondary
                                },
                                "& .MuiInputLabel-root.Mui-focused": {
                                    color: "var(--brand-secondary)", //  same green tone for label
                                },
                            }}
                        />
                    </div>

                </div>

                <div className="border-t border-gray-200"></div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                            <tr>
                                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                                <th className="py-3 px-3 text-center">Code</th>
                                <th className="py-3 px-3 text-center">Type</th>
                                <th className="py-3 px-3 text-center">Value</th>
                                {/* <th className="py-3 px-3 text-center">Creator</th> */}
                                <th className="py-3 px-3 text-center">Status</th>
                                <th className="py-3 px-3 text-center">Start</th>
                                <th className="py-3 px-3 text-center">End</th>
                                <th className="py-3 px-3 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-10 text-center text-gray-500">
                                        Loading coupons...
                                    </td>
                                </tr>
                            ) : paginated.length > 0 ? (
                                paginated.map((coupon, idx) => (
                                    <tr key={coupon.id} className="hover:bg-gray-100 transition">
                                        <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
                                        <td className="py-3 px-3 text-center">{coupon.code}</td>
                                        <td className="py-3 px-3 text-center">{coupon.discountType}</td>
                                        <td className="py-3 px-3 text-center">{coupon.discountValue}</td>
                                        {/* <td className="py-3 px-3 text-center">{coupon.creator?.name || "-"}</td> */}
                                        <td className="py-3 px-3 text-center">
                                            {coupon.isActive ? (
                                                <CheckCircle className="text-green-500 inline" size={18} />
                                            ) : (
                                                <XCircle className="text-red-500 inline" size={18} />
                                            )}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            {coupon.startDate
                                                ? new Date(coupon.startDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            {coupon.endDate
                                                ? new Date(coupon.endDate).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="py-3 px-3 text-center">
                                            <IconButton onClick={(e) => openMenu(e, coupon.id)}>
                                                <MoreVertical size={18} />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={9} className="py-10 text-center text-gray-500">
                                        No coupons found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && filtered.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filtered.length}
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
                        if (selectedId) handleEdit(selectedId);
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

            <PopupAlert
                type={popUpAlertData.type}
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
