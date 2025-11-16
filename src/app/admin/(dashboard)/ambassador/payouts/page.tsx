"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { ambassadorPayoutService } from "@/lib/services/ambassadorPayoutService";
import { Search, Eye, CheckCircle, DollarSign } from "lucide-react";
import AlertMessage from "@/components/AlertMessage";
import Pagination from "@/components/admin/Pagination";
import PayoutModal from "@/components/admin/PayoutModal";

export default function AmbassadorPayoutPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const token = session?.user?.token;

    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState("all");
    const [ambassadorFilter, setAmbassadorFilter] = useState("all");

    const [modal, setModal] = useState<any>(null);
    const [alert, setAlert] = useState<{
        isOpen: boolean;
        type: "success" | "error" | "";
        message: string;
    }>({ isOpen: false, type: "", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (status === "loading") return;

        if (!session?.user || session.user.role !== "admin") {
            router.replace(ROUTES.ADMIN.LOGIN);
            return;
        }

        loadInvoices();
    }, [status, session]);

    const loadInvoices = async () => {
        setLoading(true);
        const data = await ambassadorPayoutService.list(token);
        setInvoices(data);
        setLoading(false);
    };

    // ===== FILTER SOURCES =====
    const monthOptions = ["all", ...new Set(invoices.map((inv) => inv.monthLabel))];

    const ambassadorOptions = [
        "all",
        ...new Set(invoices.map((inv) => inv.ambassador.user.name)),
    ];

    const clearFilters = () => {
        setStatusFilter("all");
        setMonthFilter("all");
        setAmbassadorFilter("all");
        setSearchTerm("");
        setCurrentPage(1);
    };

    // ===== FILTERING =====
    const filtered = invoices.filter((inv) => {
        const bySearch =
            inv.ambassador.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

        const byStatus =
            statusFilter === "all" ||
            (statusFilter === "paid" && inv.isPaid) ||
            (statusFilter === "unpaid" && !inv.isPaid);

        const byMonth = monthFilter === "all" || inv.monthLabel === monthFilter;

        const byAmbassador =
            ambassadorFilter === "all" ||
            inv.ambassador.user.name === ambassadorFilter;

        return bySearch && byStatus && byMonth && byAmbassador;
    });

    // ===== PAGINATION =====
    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    // ===== MARK PAID =====
    const handleMarkPaid = async () => {
        if (!modal.paymentMethod || !modal.paymentRef) {
            setAlert({ isOpen: true, type: "error", message: "Please fill all fields" });
            return;
        }

        setSubmitting(true);
        await ambassadorPayoutService.markPaid(token, {
            invoiceId: modal.id,
            paymentMethod: modal.paymentMethod,
            paymentRef: modal.paymentRef,
        });

        setAlert({ isOpen: true, type: "success", message: "Invoice marked paid!" });
        setModal(null);
        await loadInvoices();
        setSubmitting(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {(alert.isOpen && alert.type) && (
                <AlertMessage
                    type={alert.type}
                    message={alert.message}
                    onClose={() => setAlert({ isOpen: false, type: "", message: "" })}
                />
            )}

            <div className="bg-white rounded-xl shadow border p-4">

                {/* FILTER BAR */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">

                    {/* Status */}
                    <select
                        className="border px-3 py-2 rounded-lg text-sm"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        <option value="all">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>

                    {/* Month */}
                    <select
                        className="border px-3 py-2 rounded-lg text-sm"
                        value={monthFilter}
                        onChange={(e) => {
                            setMonthFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        {monthOptions.map((m) => (
                            <option key={m} value={m}>
                                {m === "all" ? "All Months" : m}
                            </option>
                        ))}
                    </select>

                    {/* Ambassador */}
                    <select
                        className="border px-3 py-2 rounded-lg text-sm"
                        value={ambassadorFilter}
                        onChange={(e) => {
                            setAmbassadorFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                    >
                        {ambassadorOptions.map((a) => (
                            <option key={a} value={a}>
                                {a === "all" ? "All Ambassador" : a}
                            </option>
                        ))}
                    </select>

                    {/* Clear Filters */}
                    <button
                        onClick={clearFilters}
                        className="text-sm text-[var(--brand-primary)] underline hover:text-[var(--brand-secondary)] transition"
                    >
                        Clear Filters
                    </button>

                    {/* Search */}
                    <div className="relative w-full md:w-72 ml-auto">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            className="border pl-10 pr-4 py-2 rounded-full w-full text-sm"
                            placeholder="Search ambassador or invoice..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-4 py-3">Ambassador</th>
                            <th className="px-4 py-3">Month</th>
                            <th className="px-4 py-3">Invoice</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-10 text-center text-gray-500">
                                    No invoices found
                                </td>
                            </tr>
                        ) : (
                            paginated.map((inv) => (
                                <tr key={inv.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{inv.ambassador.user.name}</td>
                                    <td className="px-4 py-3">{inv.monthLabel}</td>
                                    <td className="px-4 py-3">
                                        <a href={inv.invoiceUrl} target="_blank" className="text-blue-600 underline">
                                            {inv.invoiceNumber}
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">£{inv.totalAmount.toFixed(2)}</td>
                                    <td className="px-4 py-3">
                                        {inv.isPaid ? (
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle size={14} /> Paid
                                            </span>
                                        ) : (
                                            <span className="text-red-600">Unpaid</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {inv.isPaid ? (
                                            <a
                                                href={inv.invoiceUrl}
                                                target="_blank"
                                                className="text-sm text-blue-600 flex items-center gap-1"
                                            >
                                                <Eye size={14} /> View
                                            </a>
                                        ) : (
                                            <button
                                                className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white px-4 py-1.5 rounded-md text-sm"
                                                onClick={() =>
                                                    setModal({ ...inv, paymentMethod: "", paymentRef: "" })
                                                }
                                            >
                                                <DollarSign size={14} className="inline" /> Mark Paid
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            {/* MODAL */}
            {modal && (
                <PayoutModal
                    show={true}
                    title={`Ambassador Invoice - ${modal.invoiceNumber}`}
                    submitText={submitting ? "Processing..." : "Confirm Payment"}
                    submitting={submitting}
                    onClose={() => setModal(null)}
                    onSubmit={handleMarkPaid}
                >
                    <input
                        className="border rounded-lg w-full px-3 py-2 mb-3"
                        placeholder="Payment Method"
                        value={modal.paymentMethod}
                        onChange={(e) => setModal({ ...modal, paymentMethod: e.target.value })}
                    />
                    <input
                        className="border rounded-lg w-full px-3 py-2"
                        placeholder="Payment Reference"
                        value={modal.paymentRef}
                        onChange={(e) => setModal({ ...modal, paymentRef: e.target.value })}
                    />
                </PayoutModal>
            )}
        </div>
    );
}
