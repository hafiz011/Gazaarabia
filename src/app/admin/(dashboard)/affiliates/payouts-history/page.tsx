"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Download } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { payoutService } from "@/lib/services/payoutService";
import Loader from "@/components/Loader";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";

export default function PayoutHistoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [items, setItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") return router.replace(ROUTES.ADMIN.LOGIN);
    if (session?.user?.role !== "admin") return router.replace(ROUTES.HOME);

    fetchHistory();
  }, [status, session]);

  const fetchHistory = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await payoutService.history(token);
    setItems(res.data || []);
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Search
  const filtered = useMemo(() => {
    return items.filter((p) =>
      p.affiliate.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.affiliate.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold">Payout History</h1>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search affiliates..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-5 text-left w-[60px]">Sn.</th>
                <th className="py-3 px-5 text-left">Affiliate</th>
                <th className="py-3 px-5 text-left">Amount</th>
                <th className="py-3 px-5 text-left">Payment Method</th>
                <th className="py-3 px-5 text-left">Paid At</th>
                <th className="py-3 px-5 text-right">Invoice</th>
              </tr>
            </thead>

            <tbody>
              {paginated.length > 0 ? (
                paginated.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-5 text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-5 font-medium">{p.affiliate.user.name}</td>
                    <td className="py-3 px-5 text-[var(--brand-primary)] font-semibold">
                      £{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-5 text-gray-600">{p.paymentMethod || "-"}</td>
                    <td className="py-3 px-5 text-gray-600">
                      {p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "-"}
                    </td>

                    <td className="py-3 px-5 text-right">
                      {p.invoiceUrl ? (
                        <a
                          href={p.invoiceUrl}
                          download
                          target="_blank"
                          className="inline-flex items-center gap-1 text-[var(--brand-primary)] hover:text-[var(--brand-secondary)] transition"
                        >
                          <Download size={18} />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs">No Invoice</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-500">
                    No payout records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
    </div>
  );
}
