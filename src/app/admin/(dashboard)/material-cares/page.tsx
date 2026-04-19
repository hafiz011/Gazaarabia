"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { materialCareService, MaterialCare } from "@/lib/services/materialCareService";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";

export default function MaterialCareListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [materialCares, setMaterialCares] = useState<MaterialCare[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  //  Fetch Material Cares initially
  useEffect(() => {
    if (token) fetchMaterialCares();
  }, [token]);

  // Debounced Search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token) fetchMaterialCares(searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  const fetchMaterialCares = async (search?: string) => {
    try {
      setLoading(true);
      const response: any = await materialCareService.getAll(token!, search);
      if (Array.isArray(response)) setMaterialCares(response);
      else if (Array.isArray(response?.data)) setMaterialCares(response.data);
      else setMaterialCares([]);
    } catch (error) {
      console.error("Failed to fetch material care:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(materialCares.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = materialCares.slice(startIndex, startIndex + pageSize);

  //  Delete Handler
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this material care?",
      onConfirm: async () => {
        try {
          await materialCareService.remove(token!, id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Material care deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchMaterialCares(searchTerm);
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete material care.",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/*  Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Material Care List</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search material care..."
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

        {/*  Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-3 text-center w-[50px]">Sn.</th>
                <th className="py-3 px-3 text-center w-[80px]">Icon</th>
                <th className="py-3 px-3 text-center">Title</th>
                <th className="py-3 px-3 text-center">Care Type</th>
                <th className="py-3 px-3 text-center">Material</th>
                <th className="py-3 px-3 text-center">Description</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item: any, idx) => (
                  <tr
                    key={item.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.title}
                          className="h-8 w-8 object-contain mx-auto"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-gray-800">
                      {item.title}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">{item.careType || "-"}</td>
                    <td className="py-3 px-3 text-center text-gray-600">{item.material || "-"}</td>
                    <td className="py-3 px-3 text-center text-gray-600 max-w-[250px]">
                      <div
                        className="line-clamp-2 overflow-hidden text-left mx-auto max-w-[250px]"
                        dangerouslySetInnerHTML={{ __html: item.description || "" }}
                      />
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => router.push(`/admin/material-cares/form/${item.id}`)}
                          className="p-1.5 text-[var(--brand-secondary)] hover:bg-gray-100 rounded-full"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-[var(--brand-primary)] hover:bg-gray-100 rounded-full"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    No material care found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*  Pagination */}
        {materialCares.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={materialCares.length}
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
