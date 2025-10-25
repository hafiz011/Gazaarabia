"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { colorService, Color } from "@/lib/services/colorService";
import { PopUpInterface } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";

export default function ColorListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [colors, setColors] = useState<Color[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  const fetchColors = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data :any = await colorService.getAll(token);
      setColors(data?.data ?? null);
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const filteredColors = useMemo(() => {
    return colors.filter(
      (color) =>
        color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        color.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [colors, searchTerm]);

  const totalPages = Math.ceil(filteredColors.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedColors = filteredColors.slice(startIndex, startIndex + pageSize);

  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this color?",
      onConfirm: async () => {
        try {
          await colorService.remove(token!, id);
          setColors((prev) => prev.filter((c) => c.id !== id));
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Color deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        } catch (error: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: error.message || "Failed to delete color",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handleEdit = (id: number) => router.push(`/admin/color?id=${id}`);

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Colors</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search colors..."
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-5 text-left w-[70px]">Sn.</th>
                <th className="py-3 px-5 text-left">Color</th>
                <th className="py-3 px-5 text-left">Hex Code</th>
                <th className="py-3 px-5 text-left">Description</th>
                <th className="py-3 px-5 text-left">Created At</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedColors.length > 0 ? (
                paginatedColors.map((color, idx) => (
                  <tr
                    key={color.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-5 text-gray-600">{startIndex + idx + 1}</td>
                    <td className="py-3 px-5 font-medium text-gray-800 flex items-center gap-2">
                      <span
                        className="inline-block w-5 h-5 rounded-full border"
                        style={{ backgroundColor: color.hexCode }}
                      ></span>
                      {color.name}
                    </td>
                    <td className="py-3 px-5 text-gray-600">{color.hexCode}</td>
                    <td className="py-3 px-5 text-gray-600">{color.description || "N/A"}</td>
                    <td className="py-3 px-5 text-gray-600">
                      {new Date(color.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleEdit(color.id)}
                        title="Edit"
                        className="text-[var(--brand-secondary)] bg-transparent hover:bg-[var(--soft-gray)] 
                                   p-2 rounded-full transition-all duration-200 
                                   hover:scale-110 hover:shadow-sm focus:outline-none 
                                   focus:ring-2 focus:ring-[var(--brand-secondary)]/30"
                      >
                        <Pencil size={20} />
                      </button>

                      <button
                        onClick={() => handleDelete(color.id)}
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
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    No colors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filteredColors.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredColors.length}
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
