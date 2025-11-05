"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { BadgeCheck, Clock, Mail, MoreVertical, Percent, Phone, Search, User, Wallet, X } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { affiliateService } from "@/lib/services/affiliateService";

export default function AffiliatesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const token = session?.user?.token;

    const [affiliates, setAffiliates] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [loading, setLoading] = useState(true);

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });


    const [selectedAffiliate, setSelectedAffiliate] = useState<any | null>(null);
    const [showModal, setShowModal] = useState(false);

    const handleView = (affiliate: any) => {
        setSelectedAffiliate(affiliate);
        setShowModal(true);
    };


    // Auth Guard (Admin Only)
    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            router.replace(ROUTES.ADMIN.LOGIN);
        } else if (session?.user?.role !== "admin") {
            router.replace(ROUTES.HOME);
        }
    }, [status, session, router]);

    // Fetch Affiliates
    const fetchAffiliates = useCallback(async () => {
        if (!token) return;
        try {
            setLoading(true);
            const data = await affiliateService.getAll(token);
            setAffiliates(data);
        } catch (error) {
            setPopUpAlertData({
                isOpen: true,
                type: "error",
                message: "Failed to fetch affiliates.",
            });
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAffiliates();
    }, [fetchAffiliates]);

    // Search
    const filteredAffiliates = useMemo(() => {
        return affiliates.filter((aff) =>
            aff.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            aff.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [affiliates, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredAffiliates.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedAffiliates = filteredAffiliates.slice(startIndex, startIndex + pageSize);

    if (status === "loading" || loading) return <Loader />;

    return (
        <>
            <div className="affiliate-page p-6 max-w-7xl mx-auto">
                <div className="bg-white rounded-xl shadow border border-[var(--soft-gray)] overflow-hidden">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
                        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Manage Affiliates</h1>

                        <div className="relative w-full sm:w-72">
                            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search affiliates..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
                            />
                        </div>
                    </div>

                    <div className="border-t border-[var(--soft-gray)]"></div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                                <tr>
                                    <th className="py-3 px-5">Sn.</th>
                                    <th className="py-3 px-5">Name</th>
                                    <th className="py-3 px-5">Email</th>
                                    <th className="py-3 px-5">Phone</th>
                                    <th className="py-3 px-5">Total Earnings</th>
                                    <th className="py-3 px-5">Pending Earnings</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">Action</th>
                                </tr>
                            </thead>


                            <tbody>
                                {paginatedAffiliates.length > 0 ? (
                                    paginatedAffiliates.map((aff, idx) => (
                                        <tr
                                            key={aff.id}
                                            className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                                        >
                                            <td className="py-3 px-5 text-gray-600">{startIndex + idx + 1}</td>
                                            <td className="py-3 px-5 font-medium text-[var(--text-primary)]">{aff.user?.name}</td>
                                            <td className="py-3 px-5 text-gray-600">{aff.user?.email}</td>
                                            <td className="py-3 px-5 text-gray-600">{aff.user?.phone || "-"}</td>
                                            <td className="py-3 px-5 font-semibold">£{aff.totalEarnings.toFixed(2)}</td>
                                            <td className="py-3 px-5 font-semibold text-orange-600">£{aff.pendingEarnings.toFixed(2)}</td>
                                            <td className="py-3 px-5">
                                                <span className={`px-2 py-1 rounded text-xs ${aff.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                                                    }`}>
                                                    {aff.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="py-3 px-5 text-right">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => handleView(aff)}
                                                        className="p-2 hover:bg-gray-200 rounded-full transition"
                                                    >
                                                        <MoreVertical size={18} className="text-gray-600" />
                                                    </button>
                                                </div>
                                            </td>


                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-500">No affiliates found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && filteredAffiliates.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredAffiliates.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    )}
                </div>
            </div>

           {showModal && selectedAffiliate && (
  <div className="affiliate-page fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999] animate-fadeIn">
    <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative border border-gray-200 animate-slideUp">

      {/* Close Button */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition"
        onClick={() => setShowModal(false)}
      >
        <X size={20} />
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <BadgeCheck className="text-[var(--brand-primary)]" size={22} />
        Affiliate Details
      </h2>

      <div className="space-y-4 text-sm">

        {/* Name */}
        <div className="flex items-center gap-3">
          <User size={18} className="text-gray-500" />
          <span className="text-gray-700 font-medium">{selectedAffiliate.user?.name}</span>
        </div>

        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail size={18} className="text-gray-500" />
          <span className="text-gray-600">{selectedAffiliate.user?.email}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-gray-500" />
          <span className="text-gray-600">{selectedAffiliate.user?.phone || "-"}</span>
        </div>

        <hr className="my-3" />

        {/* Commissions */}
        <div className="flex items-center gap-3">
          <Percent size={18} className="text-gray-500" />
          <span className="text-gray-700">
            <b>Admin Commission:</b> {selectedAffiliate.baseCommission}%
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Percent size={18} className="text-gray-500" />
          <span className="text-gray-700">
            <b>Share Commission:</b> {selectedAffiliate.shareCommission}%
          </span>
        </div>

        <hr className="my-3" />

        {/* Earnings */}
        <div className="flex items-center gap-3">
          <Wallet size={18} className="text-green-600" />
          <span className="text-gray-800 font-semibold">
            Total Earned: £{selectedAffiliate.totalEarnings.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Clock size={18} className="text-orange-500" />
          <span className="text-gray-800 font-semibold">
            Pending: £{selectedAffiliate.pendingEarnings.toFixed(2)}
          </span>
        </div>

        <hr className="my-3" />

        {/* Status */}
        <div className="flex items-center gap-3">
          <BadgeCheck size={18} className={selectedAffiliate.isActive ? "text-green-600" : "text-red-600"} />
          <span className={`font-medium ${selectedAffiliate.isActive ? "text-green-700" : "text-red-600"}`}>
            {selectedAffiliate.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Joined */}
        <div className="flex items-center gap-3">
          <Clock size={18} className="text-gray-500" />
          <span className="text-gray-600">
            Joined: {new Date(selectedAffiliate.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  </div>
)}


        </>
    );
}
