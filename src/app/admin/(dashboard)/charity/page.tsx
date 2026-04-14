"use client";

import { useEffect, useState } from "react";
import { Search, Eye, HeartHandshake, TrendingUp, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import { charityService } from "@/lib/services/charityService";
import { GBP } from "@/lib/utils";
// import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { useModalStore } from "@/lib/stores/modalStore";
import Loader from "@/components/Loader";

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
    const modalAction = useModalStore((state) => state.action);
    const clearModal = useModalStore((state) => state.clearModal);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({ isOpen: false, type: "", message: "" });

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") { router.replace(ROUTES.ADMIN.LOGIN); return; }
        else if (status === "authenticated" && !allowedRoles.includes(session?.user?.role)) { router.replace(ROUTES.HOME); return; }
    }, [status, session, router]);

    useEffect(() => { if (token) fetchDonations(); }, [token]);

    useEffect(() => {
        const timeout = setTimeout(() => { if (token) fetchDonations(searchTerm); }, 350);
        return () => clearTimeout(timeout);
    }, [searchTerm, token]);

    const fetchDonations = async (search?: string) => {
        try {
            setLoading(true);
            const response: any = await charityService.getAll(token!, search);
            let list = Array.isArray(response?.donations) ? response.donations : Array.isArray(response) ? response : [];
            setDonations(list);
        } catch (error) {
            console.error("Failed to fetch charity donations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modalAction === "download-charity") { exportToExcel(); clearModal(); }
    }, [modalAction, clearModal]);

    // const exportToExcel = () => {
    //     if (!donations || donations.length === 0) { alert("No donations to export"); return; }
    //     const excelData = donations.map((item, index) => ({
    //         SN: index + 1, Transaction_ID: item.transactionId || "—",
    //         Donor: item.anonymous ? "Anonymous" : item.name || "—", Email: item.email,
    //         Amount: item.amount, Order_ID: item.orderId || "—",
    //         Status: item.paymentStatus, Date: new Date(item.createdAt).toLocaleString(),
    //     }));
    //     const worksheet = XLSX.utils.json_to_sheet(excelData);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, "Donations");
    //     XLSX.writeFile(workbook, "charity_donations.xlsx");
    // };

    const exportToExcel = async () => {
        if (!donations || donations.length === 0) {
            alert("No donations to export");
            return;
        }

        const excelData = donations.map((item, index) => ({
            SN: index + 1,
            Transaction_ID: item.transactionId || "—",
            Donor: item.anonymous ? "Anonymous" : item.name || "—",
            Email: item.email,
            Amount: item.amount,
            Order_ID: item.orderId || "—",
            Status: item.paymentStatus,
            Date: new Date(item.createdAt).toLocaleString(),
        }));

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Donations");

        // headers
        sheet.addRow([
            "SN",
            "Transaction ID",
            "Donor",
            "Email",
            "Amount",
            "Order ID",
            "Status",
            "Date",
        ]);

        // data rows
        excelData.forEach((item) => {
            sheet.addRow([
                item.SN,
                item.Transaction_ID,
                item.Donor,
                item.Email,
                item.Amount,
                item.Order_ID,
                item.Status,
                item.Date,
            ]);
        });

        const buffer = await workbook.xlsx.writeBuffer();

        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "charity_donations.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const totalPages = Math.ceil(donations.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = donations.slice(startIndex, startIndex + pageSize);

    const totalAmount = donations.reduce((acc, d) => acc + (d.amount || 0), 0);
    const completedCount = donations.filter(d => d.paymentStatus === "completed").length;
    const pendingCount = donations.filter(d => d.paymentStatus === "pending").length;

    if (status === "loading" || loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-[#1E2A4A] text-white p-8 rounded-b-[2rem] shadow-lg mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Charity Donations</h1>
                            <p className="text-blue-200">View and manage all charity donations from orders.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-pink-500/20 rounded-xl text-pink-300"><HeartHandshake size={24} /></div>
                                <div>
                                    <p className="text-sm text-blue-200">Total Donated</p>
                                    <h3 className="text-2xl font-bold">{GBP.format(totalAmount)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-300"><CheckCircle2 size={24} /></div>
                                <div>
                                    <p className="text-sm text-green-200">Completed</p>
                                    <h3 className="text-2xl font-bold">{completedCount}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300"><Clock size={24} /></div>
                                <div>
                                    <p className="text-sm text-amber-200">Pending</p>
                                    <h3 className="text-2xl font-bold">{pendingCount}</h3>
                                </div>
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
                        <input type="text" placeholder="Search donations..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm" />
                    </div>
                    <p className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
                        {donations.length} total donations
                    </p>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">Sn.</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item: any, idx) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 text-gray-500">{startIndex + idx + 1}</td>
                                            <td className="px-6 py-5 font-mono text-xs text-gray-600">{item.transactionId || "—"}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600 font-bold text-sm">
                                                        {item.anonymous ? "A" : (item.name || "?").charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{item.anonymous ? "Anonymous" : item.name || "—"}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-gray-500 text-xs">{item.email}</td>
                                            <td className="px-6 py-5 font-bold text-green-600">{GBP.format(item.amount)}</td>
                                            <td className="px-6 py-5 text-gray-500">{item.orderId ? `#${item.orderId}` : "—"}</td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.paymentStatus === "completed" ? "bg-green-50 text-green-700"
                                                    : item.paymentStatus === "pending" ? "bg-amber-50 text-amber-700"
                                                        : "bg-red-50 text-red-700"}`}>
                                                    {item.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-gray-500 text-xs">{new Date(item.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-5 text-right">
                                                <button onClick={() => router.push(`/admin/charity/${item.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={9} className="py-14 text-center text-gray-400 italic">No donations found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {donations.length > 0 && (
                        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={donations.length}
                            pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
                    )}
                </div>
            </div>

            <PopupAlert type={popUpAlertData.type as any} message={popUpAlertData.message}
                confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
                cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
                onConfirm={popUpAlertData.onConfirm} onCancel={popUpAlertData.onCancel}
                show={popUpAlertData.isOpen} />
        </div>
    );
}
