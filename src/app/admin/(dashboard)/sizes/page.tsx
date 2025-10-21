"use client";

import { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import { sizeService } from "@/lib/services/sizeService";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";

interface Size {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export default function SizeListPage() {
   const router = useRouter();

  const [sizes, setSizes] = useState<Size[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  // ✅ Fetch sizes
  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await sizeService.getAll();
      setSizes(data);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const filteredSizes = useMemo(() => {
    return sizes.filter(
      (size) =>
        size.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        size.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sizes, searchTerm]);

  const totalPages = Math.ceil(filteredSizes.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSizes = filteredSizes.slice(startIndex, startIndex + pageSize);

  // 🗑️ Delete confirmation + API
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this size?",
      onConfirm: async () => {
        try {
          await sizeService.remove(id);
          setSizes((prev) => prev.filter((s) => s.id !== id));

          const newTotalPages = Math.ceil((sizes.length - 1) / pageSize);
          if (currentPage > newTotalPages && currentPage > 1) {
            setCurrentPage(newTotalPages);
          }

          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Size deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        } catch (error: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: error.message || "Failed to delete size",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handleEdit = (id: number) => {
    console.log("Edit size", id);
    router.push("/admin/size-add?id="+id)
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* ✅ Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Sizes</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sizes..."
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

        {/* ✅ Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-5 text-left w-[70px]">Sn.</th>
                <th className="py-3 px-5 text-left">Size Name</th>
                <th className="py-3 px-5 text-left">Description</th>
                <th className="py-3 px-5 text-left">Created At</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    Loading sizes...
                  </td>
                </tr>
              ) : paginatedSizes.length > 0 ? (
                paginatedSizes.map((size, idx) => (
                  <tr
                    key={size.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-5 text-gray-600">{startIndex + idx + 1}</td>
                    <td className="py-3 px-5 font-medium text-gray-800">{size.name}</td>
                    <td className="py-3 px-5 text-gray-600">{size.description || "-"}</td>
                    <td className="py-3 px-5 text-gray-600">
                      {new Date(size.createdAt).toLocaleDateString()}
                    </td>
                    {/* <td className="py-3 px-5 text-right flex justify-end gap-3"> */}
                   <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleEdit(size.id)}
                        title="Edit"
                        className="text-[var(--brand-secondary)] bg-transparent hover:bg-[var(--soft-gray)] 
                                   p-2 rounded-full transition-all duration-200 
                                   hover:scale-110 hover:shadow-sm focus:outline-none 
                                   focus:ring-2 focus:ring-[var(--brand-secondary)]/30"
                      >
                        <Pencil size={20} />
                      </button>

                      <button
                        onClick={() => handleDelete(size.id)}
                        title="Delete"
                        className="text-[var(--brand-primary)] bg-transparent hover:bg-[var(--soft-gray)] 
                                   p-2 rounded-full transition-all duration-200 
                                   hover:scale-110 hover:shadow-sm focus:outline-none 
                                   focus:ring-2 focus:ring-[var(--brand-primary)]/30"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    No sizes found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        {!loading && filteredSizes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSizes.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ✅ Confirmation Popup */}
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
