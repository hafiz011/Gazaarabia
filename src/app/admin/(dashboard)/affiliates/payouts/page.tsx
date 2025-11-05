"use client";

import { useEffect, useState } from "react";
import { payoutService } from "@/lib/services/payoutService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import PayoutModal from "@/components/admin/PayoutModal";
import { Search, DollarSign } from "lucide-react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { AlertInterface, PopUpInterface } from "@/lib/types";

export default function AffiliatePayoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const token = session?.user?.token;

  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modal, setModal] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Alert states
  const [alertMessageData, setAlertMessageData] = useState<AlertInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return router.replace(ROUTES.ADMIN.LOGIN);
    if (session?.user?.role !== "admin") return router.replace(ROUTES.HOME);

    fetchAffiliates();
  }, [status, session]);

  const fetchAffiliates = async () => {
    setLoading(true);
    const data = await payoutService.list(token);
    setAffiliates(data);
    setLoading(false);
  };

  const filtered = affiliates.filter((a: any) =>
    a.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkPaid = async () => {
    if (!modal.paymentMethod.trim() || !modal.paymentRef.trim()) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Payment Method and Transaction Reference are required.",
        onConfirm: () => setPopUpAlertData({ ...popUpAlertData, isOpen: false }),
      });
      return;
    }

    try {
      setSubmitting(true);

      await payoutService.markPaid(token, {
        affiliateId: modal.id,
        paymentMethod: modal.paymentMethod,
        paymentRef: modal.paymentRef,
      });

      setAlertMessageData({
        isOpen: true,
        type: "success",
        message: "Payout processed successfully!",
      });

      setModal(null);
      fetchAffiliates();
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to process payout.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ✅ Global message */}
      {(alertMessageData.isOpen && alertMessageData.type) && (
        <div className="mb-4">
          <AlertMessage
            type={alertMessageData.type}
            message={alertMessageData.message}
            onClose={() => setAlertMessageData({ ...alertMessageData, isOpen: false })}
          />
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold">Affiliate Payouts</h1>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search affiliates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                <th className="py-3 px-5 text-left">Affiliate</th>
                <th className="py-3 px-5 text-left">Email</th>
                <th className="py-3 px-5 text-left">Pending Earnings</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a: any, idx) => (
                  <tr
                    key={idx}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-5 font-medium">{a.user.name}</td>
                    <td className="py-3 px-5 text-gray-600">{a.user.email}</td>
                    <td className="py-3 px-5 font-semibold text-[var(--brand-primary)]">
                      £{a.pendingEarnings.toFixed(2)}
                    </td>

                    <td className="py-3 px-5 text-right">
                      <button
                       // disabled={a.pendingEarnings <= 0}
                        onClick={() =>
                          setModal({ id: a.id, name: a.user.name, paymentMethod: "", paymentRef: "" })
                        }
                        className="inline-flex items-center gap-1 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white px-4 py-1.5 rounded-md text-sm disabled:opacity-50"
                      >
                        <DollarSign size={14} /> Mark Paid
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No affiliates found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <PayoutModal
          show={true}
          title={`Process Payout - ${modal.name}`}
          submitText={submitting ? "Processing..." : "Confirm Payout"}
          submitting={submitting}
          onClose={() => setModal(null)}
          onSubmit={handleMarkPaid}
        >
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Payment Method (Bank, PayPal, UPI...)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={modal.paymentMethod}
              onChange={(e) => setModal({ ...modal, paymentMethod: e.target.value })}
            />

            <input
              type="text"
              placeholder="Payment Reference / Transaction ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              value={modal.paymentRef}
              onChange={(e) => setModal({ ...modal, paymentRef: e.target.value })}
            />
          </div>
        </PayoutModal>
      )}

      {/* Confirmation popup */}
      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText="OK"
        onConfirm={popUpAlertData.onConfirm}
        show={popUpAlertData.isOpen}
      />
    </div>
  );
}
