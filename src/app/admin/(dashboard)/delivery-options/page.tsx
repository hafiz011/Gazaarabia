"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import Pagination from "@/components/admin/Pagination";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { deliveryOptionService } from "@/lib/services/deliveryOptionService";
import { ROUTES } from "@/constants/routes";

export default function DeliveryOptionsListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [deliveryOptions, setDeliveryOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // 🟡 Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  // 🟡 Fetch all delivery options with token
  const fetchDeliveryOptions = async () => {
    if (!session?.user?.token) return;
    try {
      setLoading(true);
      const data: any = await deliveryOptionService.getAll(session.user.token);
      setDeliveryOptions(data?.data ?? null);
    } catch (error: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: error.message || "Failed to fetch delivery options.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) fetchDeliveryOptions();
  }, [session?.user?.token]);

  // 🟡 Filter & pagination
  const filteredOptions = useMemo(() => {
    return deliveryOptions.filter(
      (opt) =>
        opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [deliveryOptions, searchTerm]);

  const totalPages = Math.ceil(filteredOptions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOptions = filteredOptions.slice(startIndex, startIndex + pageSize);

  // 🟡 Delete with token
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this delivery option?",
      onConfirm: async () => {
        try {
          await deliveryOptionService.remove(session?.user?.token as string, id);
          setDeliveryOptions((prev) => prev.filter((d) => d.id !== id));
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Delivery option deleted successfully!",
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          });
        } catch (error: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: error.message || "Failed to delete delivery option",
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };

  const handleEdit = (id: number) => {
    router.push(`/admin/delivery-options/form/${id}`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {(alertMessageData.isOpen && alertMessageData.type) && (
        <AlertMessage
          type={alertMessageData.type}
          message={alertMessageData.message}
          onClose={() => setAlertMessageData((p) => ({ ...p, isOpen: false }))}
        />
      )}

      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Manage Delivery Options
          </h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search delivery options..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-5 text-left w-[70px]">Sn.</th>
                <th className="py-3 px-5 text-left">Name</th>
                <th className="py-3 px-5 text-left">Description</th>
                <th className="py-3 px-5 text-left">Min Time</th>
                <th className="py-3 px-5 text-left">Max Time</th>
                <th className="py-3 px-5 text-left">Cut Off</th>
                <th className="py-3 px-5 text-left">Cost</th>
                <th className="py-3 px-5 text-left">Free Over</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    Loading delivery options...
                  </td>
                </tr>
              ) : paginatedOptions.length > 0 ? (
                paginatedOptions.map((option, idx) => (
                  <tr
                    key={option.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition relative`}
                  >
                    <td className="py-3 px-5">{startIndex + idx + 1}</td>
                    {/* <td className="py-3 px-5 font-medium">{option.name}</td>
                    <td className="py-3 px-5">{option.description}</td> */}
                    <td className="py-3 px-5 font-medium max-w-[180px] truncate">{option.name}</td>
                    <td className="py-3 px-5 max-w-[280px] truncate">{option.description}</td>

                    <td className="py-3 px-5">{option.minTime}</td>
                    <td className="py-3 px-5">{option.maxTime}</td>
                    <td className="py-3 px-5">{option.cutOffTime}</td>
                    <td className="py-3 px-5">₹ {option.cost}</td>
                    <td className="py-3 px-5">
                      {option.freeOver > 0 ? `₹ ${option.freeOver}` : "-"}
                    </td>
                    <td className="py-3 px-5">{option.status}</td>
                    <td className="py-3 px-3 text-right relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === option.id ? null : option.id)
                        }
                        className="p-2 rounded-full hover:bg-gray-200"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {openMenuId === option.id && (
                        <div
                          className="absolute right-8 top-8 bg-white border rounded-lg shadow-md w-36 z-10"
                          onMouseLeave={() => setOpenMenuId(null)}
                        >
                          <button
                            onClick={() => handleEdit(option.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            <Pencil size={16} className="text-[var(--brand-secondary)]" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(option.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 text-[var(--brand-primary)]"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    No delivery options found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredOptions.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOptions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      <PopupAlert
        type={popUpAlertData.type as any}
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
