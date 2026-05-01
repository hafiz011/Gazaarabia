"use client";

import { useState, useMemo, useEffect } from "react";
import { Pencil, ShoppingBag, Trash2, Search, Plus, Package, CheckCircle, XCircle, AlertCircle, TrendingUp, Tag, MoreVertical } from "lucide-react";
import Pagination from "@/components/seller/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { productService } from "@/lib/services/seller/productService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";

interface Product {
  id: number;
  title: string;
  sellingPrice: number;
  brand?: { name: string };
  category?: { name: string };
  categories: any;
  productimage?: { url: string }[];
  active: boolean;
  createdAt: string;
}

export default function ProductListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const fetchProducts = async () => {
    try {
      if (initialLoading) setLoading(false);
      else setLoading(true);

      const res = await productService.getAll(token!, searchTerm);
      setProducts(res.data || res);
    } catch (error) {
      console.error(" Error fetching products:", error);
    } finally {
      setInitialLoading(false);
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

  // Stats calculation
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter(p => p.active).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [products]);

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
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const handleEdit = (id: number) => {
    router.push(`/seller/products/form/${id}`);
  };

  const formatGBP = (amount: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

  if (status === "loading" || initialLoading) return <Loader />;

  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto w-full space-y-8 animate-fadeIn">
      {/* Header & Stats Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Inventory <span className="text-[var(--brand-primary)]">Management</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage, track and optimize your product catalog.</p>
        </div>

        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <button
            onClick={() => router.push("/seller/products/form")}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-[1.5rem] font-bold transition-all shadow-xl shadow-black/10 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Products", value: stats.total, icon: Package, color: "blue" },
          { label: "Active Items", value: stats.active, icon: CheckCircle, color: "emerald" },
          { label: "Inactive/Draft", value: stats.inactive, icon: XCircle, color: "rose" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full transition-transform group-hover:scale-150 duration-700`} />
            <div className="flex items-center gap-6 relative z-10">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden relative">
        {/* Toolbar */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="relative w-full md:w-96 group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--brand-primary)] transition-colors" />
            <input
              type="text"
              placeholder="Search by title, brand, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-50 border-none rounded-2xl pl-12 pr-6 py-4 text-sm font-medium focus:ring-2 focus:ring-[var(--brand-primary)]/20 transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 font-bold uppercase tracking-widest">
            <span>Showing {paginatedProducts.length} of {filteredProducts.length} Results</span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Info</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory Details</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pricing</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !initialLoading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p, idx) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-all duration-300">
                    <td className="py-6 px-8">
                      <div className="flex items-center gap-6">
                        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0 group-hover:scale-105 transition-transform">
                          {p.productimage?.[0]?.url ? (
                            <img src={p.productimage[0].url} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg line-clamp-1">{p.title}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Tag size={12} className="text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">{p.brand?.name || "No Brand"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={12} className="text-gray-400" />
                          <span className="text-xs font-medium text-gray-500">{p.categories?.name || "General"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex flex-col">
                        <span className="text-xl font-black text-gray-900">{formatGBP(p.sellingPrice)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base Price</span>
                      </div>
                    </td>
                    <td className="py-6 px-8 text-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${p.active
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-100"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.active ? "bg-emerald-500" : "bg-rose-500"} animate-pulse`} />
                        {p.active ? "Live" : "Draft"}
                      </span>
                    </td>
                    <td className="py-6 px-8">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => handleEdit(p.id)}
                          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[var(--brand-secondary)] hover:border-[var(--brand-secondary)]/30 hover:shadow-lg hover:shadow-[var(--brand-secondary)]/5 transition-all active:scale-95 group/btn"
                          title="Edit Product"
                        >
                          <Pencil size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-500/5 transition-all active:scale-95 group/btn"
                          title="Delete Product"
                        >
                          <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={48} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-gray-900">Inventory Empty</h3>
                        <p className="text-gray-400 font-medium mt-2">No products match your current filters or you haven't added any yet.</p>
                      </div>
                      <button
                        onClick={() => router.push("/seller/products/form")}
                        className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/10"
                      >
                        Add Your First Product
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        {!initialLoading && filteredProducts.length > 0 && (
          <div className="p-8 bg-gray-50/30 border-t border-gray-50">
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
