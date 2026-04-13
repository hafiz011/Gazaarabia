"use client";

import { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Search } from "lucide-react";
import Pagination from "@/components/seller/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { productService } from "@/lib/services/seller/productService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Product {
  id: number;
  title: string;
  sellingPrice: number;
  brand?: { name: string };
  category?: { name: string };
  categories: any,
  // images?: { url: string }[];
  productimage?: { url: string }[];
  active: boolean;
  createdAt: string;
}

export default function ProductListPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = session?.user?.token;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll(token!, searchTerm);
      setProducts(res.data || res);
    } catch (error) {
      console.error(" Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, searchTerm]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this product?",
      onConfirm: async () => {
        await productService.remove(token!, id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setPopUpAlertData((prev) => ({ ...prev, isOpen: false }));
      },
      onCancel: () =>
        setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handleEdit = (id: number) => {
    router.push(`/seller/products/form/${id}`);
  };

  return (
    <div className="p-4 sm:p-6 mx-auto w-full">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Products</h1>
          <div className="relative w-full md:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm ?? ""}
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
        <div className="overflow-x-scroll overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
          <table className="min-w-[1200px] w-full text-sm border-collapse">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium sticky top-0">
              <tr>
                <th className="py-3 px-5 text-left w-[50px]">#</th>
                <th className="py-3 px-5 text-left">Image</th>
                <th className="py-3 px-5 text-left">Title</th>
                <th className="py-3 px-5 text-left">Brand</th>
                <th className="py-3 px-5 text-left">Category</th>
                <th className="py-3 px-5 text-left">Price</th>
                <th className="py-3 px-5 text-left">Status</th>
                <th className="py-3 px-5 text-left">Created</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 text-sm">
                    Loading products...
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-5">{startIndex + idx + 1}</td>
                    <td className="py-3 px-5">
                      {p.productimage?.[0]?.url ? (
                        <img
                          src={p.productimage[0].url}
                          alt={p.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="py-3 px-5 truncate max-w-[180px]">{p.title}</td>
                    <td className="py-3 px-5">{p.brand?.name || "-"}</td>
                    <td className="py-3 px-5">{p.categories?.name || "-"}</td>
                    <td className="py-3 px-5">£{p.sellingPrice}</td>
                    <td className="py-3 px-5">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                      >
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-600 whitespace-nowrap">
                      {new Intl.DateTimeFormat("en-GB").format(new Date(p.createdAt))}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(p.id)}
                          className="text-[var(--brand-secondary)] p-2 rounded-full hover:bg-gray-100"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-[var(--brand-primary)] p-2 rounded-full hover:bg-gray-100"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 text-sm">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredProducts.length > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredProducts.length}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
            />
          </div>
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
