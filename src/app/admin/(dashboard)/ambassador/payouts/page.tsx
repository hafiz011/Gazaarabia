"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { ambassadorPayoutService } from "@/lib/services/ambassadorPayoutService";
import {
    Search, Eye, CheckCircle2, Clock, Banknote, FileText, X
} from "lucide-react";
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
    const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({ isOpen: false, type: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (status === "loading") return;
        if (!session?.user || session.user.role !== "admin") { router.replace(ROUTES.ADMIN.LOGIN); return; }
        loadInvoices();
    }, [status, session]);

    const loadInvoices = async () => {
        setLoading(true);
        const data = await ambassadorPayoutService.list(token);
        setInvoices(data || []);
        setLoading(false);
    };

    const monthOptions = ["all", ...new Set(invoices.map((inv) => inv.monthLabel))];
    const ambassadorOptions = ["all", ...new Set(invoices.map((inv) => inv.ambassador?.user?.name))];

    const clearFilters = () => {
        setStatusFilter("all"); setMonthFilter("all");
        setAmbassadorFilter("all"); setSearchTerm(""); setCurrentPage(1);
    };

    const filtered = invoices.filter((inv) => {
        const bySearch =
            (inv.ambassador?.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (inv.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
        const byStatus = statusFilter === "all" || (statusFilter === "paid" && inv.isPaid) || (statusFilter === "unpaid" && !inv.isPaid);
        const byMonth = monthFilter === "all" || inv.monthLabel === monthFilter;
        const byAmbassador = ambassadorFilter === "all" || inv.ambassador?.user?.name === ambassadorFilter;
        return bySearch && byStatus && byMonth && byAmbassador;
    });

    const totalPages = Math.ceil(filtered.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);

    const totals = useMemo(() => ({
        total: invoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0),
        paid: invoices.filter(i => i.isPaid).reduce((acc, inv) => acc + (inv.totalAmount || 0), 0),
        unpaid: invoices.filter(i => !i.isPaid).reduce((acc, inv) => acc + (inv.totalAmount || 0), 0),
    }), [invoices]);

    const handleMarkPaid = async () => {
        if (!modal.paymentMethod || !modal.paymentRef) {
            setAlert({ isOpen: true, type: "error", message: "Please fill all fields" });
            return;
        }
        setSubmitting(true);
        await ambassadorPayoutService.markPaid(token, { invoiceId: modal.id, paymentMethod: modal.paymentMethod, paymentRef: modal.paymentRef });
        setAlert({ isOpen: true, type: "success", message: "Invoice marked paid!" });
        setModal(null);
        await loadInvoices();
        setSubmitting(false);
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Header */}
            <div className="bg-[#1E2A4A] text-white p-8 rounded-b-[2rem] shadow-lg mb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">Ambassador Payouts</h1>
                            <p className="text-blue-200">Manage and approve ambassador commission payments.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/20 rounded-xl text-blue-300"><FileText size={24} /></div>
                                <div>
                                    <p className="text-sm text-blue-200">Total Invoiced</p>
                                    <h3 className="text-2xl font-bold">£{totals.total.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-500/20 rounded-xl text-green-300"><CheckCircle2 size={24} /></div>
                                <div>
                                    <p className="text-sm text-green-200">Total Paid</p>
                                    <h3 className="text-2xl font-bold">£{totals.paid.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-300"><Clock size={24} /></div>
                                <div>
                                    <p className="text-sm text-amber-200">Outstanding</p>
                                    <h3 className="text-2xl font-bold">£{totals.unpaid.toFixed(2)}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {(alert.isOpen && alert.type) && (
                    <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert({ isOpen: false, type: "", message: "" })} />
                )}

                {/* Filters */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <div className="flex flex-wrap items-center gap-3 flex-1">
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                                <option value="all">All Status</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={monthFilter} onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}>
                                {monthOptions.map((m) => <option key={m as string} value={m as string}>{m === "all" ? "All Months" : m as string}</option>)}
                            </select>
                            <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={ambassadorFilter} onChange={(e) => { setAmbassadorFilter(e.target.value); setCurrentPage(1); }}>
                                {ambassadorOptions.map((a) => <option key={a as string} value={a as string}>{a === "all" ? "All Ambassadors" : a as string}</option>)}
                            </select>
                            {(statusFilter !== "all" || monthFilter !== "all" || ambassadorFilter !== "all" || searchTerm) && (
                                <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition">
                                    <X size={14} /> Clear Filters
                                </button>
                            )}
                        </div>
                        <div className="relative w-full lg:w-72">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input className="border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Search ambassador or invoice..." value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ambassador</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginated.length === 0 ? (
                                    <tr><td colSpan={6} className="py-14 text-center text-gray-400 italic">No invoices found matching your criteria.</td></tr>
                                ) : paginated.map((inv) => (
                                    <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-sm">
                                                    {(inv.ambassador?.user?.name || "A").charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 text-sm">{inv.ambassador?.user?.name}</p>
                                                    <p className="text-xs text-gray-400">{inv.ambassador?.user?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm text-gray-600">{inv.monthLabel}</td>
                                        <td className="px-6 py-5">
                                            <a href={inv.invoiceUrl} target="_blank" className="text-blue-600 hover:underline text-sm font-medium">{inv.invoiceNumber}</a>
                                        </td>
                                        <td className="px-6 py-5 font-semibold text-gray-900">£{(inv.totalAmount || 0).toFixed(2)}</td>
                                        <td className="px-6 py-5">
                                            {inv.isPaid ? (
                                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                    <CheckCircle2 size={12} /> Paid
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                                                    <Clock size={12} /> Unpaid
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            {inv.isPaid ? (
                                                <a href={inv.invoiceUrl} target="_blank" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 transition font-medium">
                                                    <Eye size={14} /> View
                                                </a>
                                            ) : (
                                                <button className="inline-flex items-center gap-1.5 bg-[#1E2A4A] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-800 transition shadow-md"
                                                    onClick={() => setModal({ ...inv, paymentMethod: "", paymentRef: "" })}>
                                                    <Banknote size={14} /> Mark Paid
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length}
                        pageSize={pageSize} onPageChange={setCurrentPage} onPageSizeChange={setPageSize} />
                </div>
            </div>

            {modal && (
                <PayoutModal show={true} title={`Ambassador Invoice — ${modal.invoiceNumber}`}
                    submitText={submitting ? "Processing..." : "Confirm Payment"} submitting={submitting}
                    onClose={() => setModal(null)} onSubmit={handleMarkPaid}>
                    <input className="border border-gray-200 rounded-xl w-full px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Payment Method (e.g. Bank Transfer)" value={modal.paymentMethod}
                        onChange={(e) => setModal({ ...modal, paymentMethod: e.target.value })} />
                    <input className="border border-gray-200 rounded-xl w-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Transaction Reference / Receipt #" value={modal.paymentRef}
                        onChange={(e) => setModal({ ...modal, paymentRef: e.target.value })} />
                </PayoutModal>
            )}
        </div>
    );
}
