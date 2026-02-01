"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { BadgeCheck, Clock, Eye, Mail, MoreVertical, Pencil, Percent, Phone, Search, Trash2, User, Wallet, X } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { affiliateService } from "@/lib/services/affiliateService";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";

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

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState<any | null>(null);

  const [showModal, setShowModal] = useState(false);

  // Auth Guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (session?.user?.role !== "admin") router.replace(ROUTES.HOME);
  }, [status, session, router]);

  // Fetch Affiliates
  const fetchAffiliates = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await affiliateService.getAll(token);
      setAffiliates(data);
    } catch {
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

  // Dropdown menu
  const openMenu = (event: React.MouseEvent<HTMLElement>, affiliate: any) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAffiliate(affiliate);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  // View Details
  const handleView = () => {
    closeMenu();
    setShowModal(true);
  };

  // Delete Affiliate
  const handleDelete = () => {
    closeMenu();
    setShowModal(false);

    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: `Are you sure you want to delete ${selectedAffiliate?.user?.name}?`,
      onConfirm: async () => {
        try {
          await affiliateService.remove(token!, selectedAffiliate.id);

          //  Success popup with OK working
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Affiliate deleted successfully!",
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          });

          fetchAffiliates();
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message,
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };


  if (status === "loading" || loading) return <Loader />;

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
            <h1 className="text-xl font-semibold text-gray-800">Manage Affiliates</h1>

            <div className="relative w-full sm:w-72">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search affiliates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 ring-red-500"
              />
            </div>
          </div>

          <div className="border-t"></div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                <tr>
                  <th className="py-3 px-5">Sn.</th>
                  <th className="py-3 px-5">Name</th>
                  <th className="py-3 px-5">Email</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Total Earnings</th>
                  <th className="py-3 px-5">Pending Earnings</th>
                  <th className="py-3 px-5">Payout</th>

                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {paginatedAffiliates.length > 0 ? (
                  paginatedAffiliates.map((aff, idx) => (
                    <tr key={aff.id} className="hover:bg-gray-100 transition">
                      <td className="py-3 px-5">{startIndex + idx + 1}</td>
                      <td className="py-3 px-5">{aff.user?.name}</td>
                      <td className="py-3 px-5">{aff.user?.email}</td>
                      <td className="py-3 px-5">{aff.type || "-"}</td>
                      <td className="py-3 px-5 font-semibold">£{aff.totalEarnings?.toFixed(2) ?? 0}</td>
                      <td className="py-3 px-5 text-orange-600 font-semibold">£{aff.pendingEarnings?.toFixed(2) ?? 0}</td>

                      <td className="py-3 px-5 text-xs">
                        {aff.bankAccount?.paypalEmail
                          ? "PayPal"
                          : aff.bankAccount?.accountNumber || aff.bankAccount?.iban
                            ? "Bank"
                            : "—"}
                      </td>


                      <td className="py-3 px-5">
                        <span className={`px-2 py-1 rounded text-xs ${aff.isActive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                          {aff.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-3 px-5 text-center">
                        <IconButton onClick={(e) => openMenu(e, aff)}>
                          <MoreVertical size={18} />
                        </IconButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={8} className="py-12 text-center text-gray-500">No affiliates found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Action Menu */}
          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
            <MenuItem onClick={handleView}>
              <ListItemIcon><Eye size={18} /></ListItemIcon>
              <ListItemText>View</ListItemText>
            </MenuItem>

            <MenuItem onClick={() => router.push(`/admin/affiliates/form/${selectedAffiliate?.id}`)}>
              <ListItemIcon><Pencil size={18} /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>

            <MenuItem onClick={handleDelete}>
              <ListItemIcon><Trash2 size={18} color="red" /></ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>

          {/* Pagination */}
          {filteredAffiliates.length > 0 && (
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

      {/*  View Modal */}
      {showModal && selectedAffiliate && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <div className="bg-white max-w-lg w-full rounded-xl p-6 shadow relative">
            <button
              className="absolute top-3 right-3"
              onClick={() => setShowModal(false)}
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <BadgeCheck className="text-red-500 mr-2" />
              Affiliate Details
            </h2>

            <div className="space-y-4 text-sm">
              {/* User Info */}
              <div className="flex gap-3 items-center">
                <User size={18} /> {selectedAffiliate.user?.name}
              </div>
              <div className="flex gap-3 items-center">
                <Mail size={18} /> {selectedAffiliate.user?.email}
              </div>
              <div className="flex gap-3 items-center">
                <Phone size={18} /> {selectedAffiliate.user?.phone || "-"}
              </div>

              <hr />

              {/* Commission */}
              <div>
                <b>Admin Commission:</b> {selectedAffiliate.baseCommission}%
              </div>
              <div>
                <b>Share Commission:</b> {selectedAffiliate.shareCommission}%
              </div>

              <hr />

              {/* Earnings */}
              <div className="flex items-center gap-3">
                <Wallet size={18} className="text-green-600" />
                <b>Total Earnings:</b> £
                {selectedAffiliate.totalEarnings?.toFixed(2) ?? 0}
              </div>

              <div className="flex items-center gap-3">
                <Clock size={18} className="text-orange-500" />
                <b>Pending Earnings:</b> £
                {selectedAffiliate.pendingEarnings?.toFixed(2) ?? 0}
              </div>

              <hr />

           {/* 🏦 Payout Details */}
<div>
  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
    <Wallet size={18} className="text-gray-600" />
    Payout Details
  </h3>

  {selectedAffiliate.bankAccount ? (
    <div className="bg-gray-50 border rounded-lg p-4 space-y-3 text-sm">

      <div className="grid grid-cols-3 gap-2">
        <span className="text-gray-500">Account Name</span>
        <span className="col-span-2 font-medium text-gray-900">
          {selectedAffiliate.bankAccount.accountName}
        </span>
      </div>

      {selectedAffiliate.bankAccount.accountNumber && (
        <div className="grid grid-cols-3 gap-2">
          <span className="text-gray-500">Account Number</span>
          <span className="col-span-2 font-mono text-gray-900">
            {selectedAffiliate.bankAccount.accountNumber}
          </span>
        </div>
      )}

      {selectedAffiliate.bankAccount.sortCode && (
        <div className="grid grid-cols-3 gap-2">
          <span className="text-gray-500">Sort Code</span>
          <span className="col-span-2 font-mono text-gray-900">
            {selectedAffiliate.bankAccount.sortCode}
          </span>
        </div>
      )}

      {selectedAffiliate.bankAccount.iban && (
        <div className="grid grid-cols-3 gap-2">
          <span className="text-gray-500">IBAN</span>
          <span className="col-span-2 font-mono text-gray-900 break-all">
            {selectedAffiliate.bankAccount.iban}
          </span>
        </div>
      )}

      {selectedAffiliate.bankAccount.paypalEmail && (
        <div className="grid grid-cols-3 gap-2">
          <span className="text-gray-500">PayPal</span>
          <span className="col-span-2 text-gray-900">
            {selectedAffiliate.bankAccount.paypalEmail}
          </span>
        </div>
      )}
    </div>
  ) : (
    <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-center text-gray-400 text-sm">
      No payout details provided.
    </div>
  )}
</div>



            </div>
          </div>
        </div>
      )}


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
    </>
  );
}
