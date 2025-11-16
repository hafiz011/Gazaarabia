"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle, AlertCircle, Eye } from "lucide-react";
import TextField from "@mui/material/TextField";
import Pagination from "@/components/admin/Pagination";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import { useRouter } from "next/navigation";
import { ambassadorService } from "@/lib/services/ambassadorService";
import { ROUTES } from "@/constants/routes";

export default function AmbassadorEarningsPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const token = session?.user?.token;

    const [invoices, setInvoices] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // auth + fetch
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace(ROUTES.AFFILIATE.LOGIN);
            return;
        }

        if (session?.user?.role !== "affiliate" || session?.user?.affiliateType !== "ambassador") {
            router.replace(ROUTES.HOME);
            return;
        }

        fetchData();
    }, [status, session, debouncedSearch]);

    const fetchData = async () => {
        if (!token) return;

        setLoading(true);

        const result = await ambassadorService.getEarnings(token);
        let list = result.invoices;

        if (debouncedSearch.trim() !== "") {
            const term = debouncedSearch.toLowerCase();
            list = list.filter(
                (inv: any) =>
                    inv.invoiceNumber.toLowerCase().includes(term) ||
                    inv.monthLabel.toLowerCase().includes(term)
            );
        }

        setInvoices(list);
        setSummary(result.summary);
        setLoading(false);
    };

    if (loading || status === "loading" || !summary) return <Loader />;

    const totalPages = Math.ceil(invoices.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginated = invoices.slice(startIndex, startIndex + pageSize);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Summary Header */}
            <h1 className="text-2xl font-semibold mb-6 text-[var(--text-primary)]">
                My Ambassador Earnings
            </h1>

            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-5 rounded-xl bg-white shadow border">
                    <p className="text-gray-500 text-sm">Total Earned</p>
                    <h2 className="text-xl font-semibold">£{summary.totalEarned.toFixed(2)}</h2>
                </div>

                <div className="p-5 rounded-xl bg-white shadow border">
                    <p className="text-gray-500 text-sm">Paid</p>
                    <h2 className="text-xl font-semibold text-green-600">
                        £{summary.totalPaid.toFixed(2)}
                    </h2>
                </div>

                <div className="p-5 rounded-xl bg-white shadow border">
                    <p className="text-gray-500 text-sm">Pending</p>
                    <h2 className="text-xl font-semibold text-orange-500">
                        £{summary.totalPending.toFixed(2)}
                    </h2>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white rounded-xl shadow border overflow-hidden">
                {/* Search */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 p-4">
                    <h2 className="text-lg font-semibold">Earnings History</h2>

                    <div className="relative w-full sm:w-72">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search invoice or month..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ sx: { pl: 4 } }}
                        />
                    </div>
                </div>

                <div className="border-t"></div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
                            <tr>
                                <th className="py-3">Sn</th>
                                <th className="py-3">Month</th>
                                <th className="py-3">Invoice</th>
                                <th className="py-3">Amount</th>
                                <th className="py-3">Status</th>
                                <th className="py-3">View</th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.length > 0 ? (
                                paginated.map((inv: any, idx: number) => (
                                    <tr key={inv.id} className="hover:bg-gray-50">
                                        <td className="py-3 text-center">{startIndex + idx + 1}</td>
                                        <td className="py-3 text-center">{inv.monthLabel}</td>
                                        <td className="py-3 text-center font-semibold">{inv.invoiceNumber}</td>
                                        <td className="py-3 text-center font-semibold">
                                            £{inv.totalAmount.toFixed(2)}
                                        </td>
                                        <td className="py-3 text-center">
                                            {inv.isPaid ? (
                                                <CheckCircle className="text-green-500 mx-auto" />
                                            ) : (
                                                <AlertCircle className="text-orange-500 mx-auto" />
                                            )}
                                        </td>
                                        <td className="py-3 text-center">
                                            {inv.invoiceUrl && (
                                                <a
                                                    href={inv.invoiceUrl}
                                                    className="text-blue-600 flex justify-center gap-1"
                                                    target="_blank"
                                                >
                                                    <Eye size={16} /> View
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-gray-500">
                                        No earnings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {invoices.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        totalItems={invoices.length}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={setPageSize}
                    />
                )}
            </div>
        </div>
    );
}
