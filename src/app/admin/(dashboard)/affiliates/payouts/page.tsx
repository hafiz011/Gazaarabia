"use client";

import { useEffect, useState, useMemo } from "react";
import { payoutService } from "@/lib/services/payoutService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { Search, Eye, CheckCircle, DollarSign } from "lucide-react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import PayoutModal from "@/components/admin/PayoutModal";
import Pagination from "@/components/admin/Pagination";

export default function AffiliateInvoicePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = session?.user?.token;

  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [affiliateFilter, setAffiliateFilter] = useState("all");

  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "";
    message: string;
  }>({ isOpen: false, type: "", message: "" });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const clearFilters = () => {
    setStatusFilter("all");
    setMonthFilter("all");
    setAffiliateFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };


  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user || session?.user.role !== "admin")
      return router.replace(ROUTES.ADMIN.LOGIN);
    fetchInvoices();
  }, [status, session]);

  const fetchInvoices = async () => {
    setLoading(true);
    const data = await payoutService.list(token);
    setInvoices(data);
    setLoading(false);
  };

  // Dropdown source lists
  const monthOptions = useMemo(() => {
    return ["all", ...new Set(invoices.map((inv) => inv.monthLabel))];
  }, [invoices]);

  const affiliateOptions = useMemo(() => {
    return ["all", ...new Set(invoices.map((inv) => inv.affiliate.user.name))];
  }, [invoices]);

  // Filtering logic
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const bySearch =
        inv.affiliate.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.affiliate.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const byStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && inv.isPaid) ||
        (statusFilter === "unpaid" && !inv.isPaid);

      const byMonth = monthFilter === "all" || inv.monthLabel === monthFilter;

      const byAffiliate = affiliateFilter === "all" || inv.affiliate.user.name === affiliateFilter;

      return bySearch && byStatus && byMonth && byAffiliate;
    });
  }, [invoices, searchTerm, statusFilter, monthFilter, affiliateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedInvoices = filteredInvoices.slice(startIndex, startIndex + pageSize);

  const handleMarkPaid = async () => {
    if (!modal.paymentMethod || !modal.paymentRef) {
      setAlert({ isOpen: true, type: "error", message: "Payment details required" });
      return;
    }

    setSubmitting(true);
    await payoutService.markPaid(token, {
      invoiceId: modal.id,
      paymentMethod: modal.paymentMethod,
      paymentRef: modal.paymentRef,
    });

    setAlert({ isOpen: true, type: "success", message: "Invoice marked paid!" });
    setModal(null);
    fetchInvoices();
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

      <div className="bg-white rounded-xl shadow border border-gray-200">

        {/* FILTERS */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4">

          {/* LEFT: FILTERS */}
          <div className="flex flex-wrap items-center gap-3">

            {/* Status */}
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>

            {/* Month */}
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setCurrentPage(1); }}
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {m === "all" ? "All Months" : m}
                </option>
              ))}
            </select>

            {/* Affiliate */}
            <select
              className="border rounded-lg px-3 py-2 text-sm"
              value={affiliateFilter}
              onChange={(e) => { setAffiliateFilter(e.target.value); setCurrentPage(1); }}
            >
              {affiliateOptions.map((a) => (
                <option key={a} value={a}>
                  {a === "all" ? "All Affiliates" : a}
                </option>
              ))}
            </select>

            {/* ✅ Clear Filters */}
            <button
              onClick={clearFilters}
              className="text-sm text-[var(--brand-primary)] underline hover:text-[var(--brand-secondary)] transition"
            >
              Clear Filters
            </button>
          </div>

          {/* RIGHT: SEARCH */}
          <div className="relative w-full lg:w-72 ml-auto">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="border rounded-full pl-10 pr-4 py-2 text-sm w-full"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>



        {/* Table */}
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700 text-xs uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Affiliate</th>
              <th className="px-5 py-3 text-left">Month</th>
              <th className="px-5 py-3 text-left">Invoice</th>
              <th className="px-5 py-3 text-left">Amount</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-12 text-gray-500 text-sm"
                >
                  No invoices found
                </td>
              </tr>
            ) : (
              paginatedInvoices.map((inv, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3">{inv.affiliate.user.name}</td>
                  <td className="px-5 py-3">{inv.monthLabel}</td>
                  <td className="px-5 py-3">
                    <a href={inv.invoiceUrl} target="_blank" className="text-[var(--brand-primary)] underline">
                      {inv.invoiceNumber}
                    </a>
                  </td>
                  <td className="px-5 py-3 font-semibold">£{inv.totalAmount.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    {inv.isPaid ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle size={14} /> Paid
                      </span>
                    ) : (
                      <span className="text-red-600">Unpaid</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {inv.isPaid ? (
                      <a href={inv.invoiceUrl} target="_blank" className="text-sm text-blue-600 flex items-center gap-1">
                        <Eye size={14} /> View
                      </a>
                    ) : (
                      <button
                        className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white px-4 py-1.5 rounded-md text-sm"
                        onClick={() => setModal({ ...inv, paymentMethod: "", paymentRef: "" })}
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />

      </div>

      {/* Modal */}
      {modal && (
        <PayoutModal
          show={true}
          title={`Mark Invoice Paid - ${modal.invoiceNumber}`}
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
