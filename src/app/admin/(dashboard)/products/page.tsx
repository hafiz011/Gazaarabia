"use client";

import { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2, Search, Plus } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { productService } from "@/lib/services/productService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ProductFilters from "@/components/admin/ProductFilters";

interface Product {
  id: number;
  title: string;
  sellingPrice: number;
  brand?: { name: string };
  category?: { name: string };
  categories: any,
  commissionValue: any,
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

  const [filters, setFilters] = useState({
    brandIds: [] as number[],
    categoryId: "",
    subcategoryId: "",
    minPrice: "",
    maxPrice: "",
    status: "",
    fromDate: "",
    toDate: "",
    sortBy: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll(token!,
        {
          search: searchTerm,
          ...filters,
        }
      );
      setProducts(res.data || res);
    } catch (error) {
      console.error(" Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProducts();
  }, [token, searchTerm, filters]);

  useEffect(() => {
    if (!token) return;

    const loadFilters = async () => {
      try {
        const res = await productService.getProductsFilters(token);

        setBrands(Array.isArray(res?.data?.brands) ? res?.data?.brands : []);
        setCategories(Array.isArray(res?.data?.categories) ? res?.data?.categories : []);
        setSubcategories(Array.isArray(res?.data?.subcategories) ? res?.data?.subcategories : []);
      } catch (err) {
        console.error("Error loading filters", err);
      }
    };

    loadFilters();
  }, [token]);

  const filteredSubcategories = filters.categoryId
    ? subcategories.filter(
      (s: any) => s.categoryId === Number(filters.categoryId)
    )
    : subcategories;

  // const filteredProducts = useMemo(() => {
  //   return products.filter((p) =>
  //     (p.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  // }, [products, searchTerm]);

  console.log('just pag products:>', products)
  const totalPages = Math.ceil(products.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

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
    router.push(`/admin/products/form/${id}`);
  };

  return (
    <div className="p-4 sm:p-6 mx-auto w-full">

      <ProductFilters
        brands={brands}
        categories={categories}
        subcategories={filteredSubcategories}
        onChange={(f: any) => {
          setFilters(f);
          setCurrentPage(1);
        }}
      />


      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Products</h1>
            <p className="text-sm text-gray-500 mt-1">View, edit, and manage your product catalogue</p>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <div className="relative w-full md:w-80 group">
              <Search size={18} className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm ?? ""}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-200 bg-gray-50 rounded-full pl-10 pr-4 py-2.5 text-sm 
                           focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all shadow-sm"
              />
            </div>
            {/* <button
              onClick={() => router.push("/admin/products/form")}
              className="bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium active:scale-95 duration-200"
            >
              <Plus size={18} strokeWidth={2.5} />
              Add Product
            </button> */}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <table className="min-w-[1200px] w-full text-sm border-collapse">
            <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase font-semibold tracking-wider sticky top-0 backdrop-blur-sm z-10 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 text-left w-[60px]">#</th>
                <th className="py-4 px-6 text-left">Image</th>
                <th className="py-4 px-6 text-left">Title</th>
                <th className="py-4 px-6 text-left">Brand</th>
                <th className="py-4 px-6 text-left">Category</th>
                <th className="py-4 px-6 text-left">Commission</th>
                <th className="py-4 px-6 text-left">Price</th>
                <th className="py-4 px-6 text-left">Created</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400 text-sm font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-gray-200 border-t-[var(--brand-primary)] rounded-full animate-spin"></div>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p, idx) => (
                  <tr
                    key={p.id}
                    className="bg-white hover:bg-blue-50/30 transition-colors duration-150 group"
                  >
                    <td className="py-4 px-6 text-gray-500 font-medium">{startIndex + idx + 1}</td>
                    <td className="py-4 px-6">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group-hover:shadow-sm transition-shadow">
                        {p.productimage?.[0]?.url ? (
                          <img
                            src={p.productimage[0].url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="text-xs font-medium">No img</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="truncate max-w-[200px] font-medium text-gray-900" title={p.title}>{p.title}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                        {p.brand?.name || "-"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{p.categories?.name || "-"}</td>
                    <td className="py-4 px-6 text-gray-600 font-medium">{p.commissionValue != null ? `${p.commissionValue}%` : "-"}</td>
                    <td className="py-4 px-6 font-semibold text-gray-900">£{parseFloat(p.sellingPrice as any).toFixed(2)}</td>
                    <td className="py-4 px-6 text-gray-500 text-xs">
                      {new Intl.DateTimeFormat("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(p.createdAt))}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => handleEdit(p.id)}
                          className="text-[var(--brand-secondary)] p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit product"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-[var(--brand-primary)] p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-gray-400 text-sm">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search size={32} className="text-gray-300 mb-2" />
                      <span className="font-medium text-gray-500">No products found</span>
                      <span className="text-xs">Try adjusting your filters or search terms</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && products.length > 0 && (
          <div className="p-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={products.length}
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
