"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Search, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { brandService } from "@/lib/services/brandService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function BrandListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const alowedRoles = ["admin"];

  const token = session?.user?.token;

  const [brands, setBrands] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });


  //  Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && !alowedRoles.includes(session?.user?.role)) {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);


  useEffect(() => {
    if (token) fetchBrands();
  }, [token]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token) fetchBrands(searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  const fetchBrands = async (search?: string) => {
    try {
      setLoading(true);
      const response: any = await brandService.getAll(token!, search);
      if (Array.isArray(response)) setBrands(response);
      else if (Array.isArray(response?.data)) setBrands(response.data);
      else setBrands([]);
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(brands.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = brands.slice(startIndex, startIndex + pageSize);

  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this brand?",
      onConfirm: async () => {
        try {
          await brandService.remove(token!, id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Brand deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchBrands(searchTerm);
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete brand.",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Brands</h1>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
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
                <th className="py-3 px-3 text-center w-[50px]">Sn.</th>
                <th className="py-3 px-3 text-center w-[80px]">Logo</th>
                <th className="py-3 px-3 text-center">Name</th>
                <th className="py-3 px-3 text-center">Trending</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((brand: any, idx) => (
                  <tr
                    key={brand.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {brand.logo ? (
                        <img src={brand.logo} alt={brand.name} className="h-8 w-8 object-contain mx-auto" />
                      ) : (
                        <span className="text-gray-400 text-xs italic">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-gray-800">
                      {brand.name}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {brand.isTrending ? (
                        <CheckCircle size={20} className="text-green-600 mx-auto" />
                      ) : (
                        <XCircle size={20} className="text-red-500 mx-auto" />
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => router.push(`/admin/brands/form/${brand.id}`)}
                          className="p-1.5 text-[var(--brand-secondary)] hover:bg-gray-100 rounded-full"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
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
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    No brands found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {brands.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={brands.length}
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
