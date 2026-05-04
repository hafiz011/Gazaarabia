"use client";

import { useState, useMemo, useEffect } from "react";
import { Pencil, ShoppingBag, Trash2, Search, Plus, Package, CheckCircle, XCircle, AlertCircle, TrendingUp, Tag, MoreVertical, Star, Filter, ChevronDown, Check } from "lucide-react";
import Pagination from "@/components/seller/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { productService } from "@/lib/services/seller/productService";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import SellerLoader from "@/components/seller/SellerLoader";

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
  totalStock: number;
  totalSold: number;
  averageRating: number;
  totalReviews: number;
}

export default function ProductListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });
  const [apiStats, setApiStats] = useState({
    totalStock: 0,
    totalSold: 0,
    averageRating: 0,
    totalReviews: 0
  });

  // Bulk Selection & Filtering State
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      if (initialLoading) setLoading(false);
      else setLoading(true);

      const res = await productService.getAll(token!, {
        search: debouncedSearch,
        status: statusFilter !== "all" ? statusFilter : undefined,
        categoryId: categoryFilter !== "all" ? categoryFilter : undefined,
        page: currentPage,
        limit: pageSize,
      });
      setProducts(res.data || []);
      setTotalCount(res.total || 0);
      if (res.stats) {
        setApiStats(res.stats);
      }
    } catch (error) {
      console.error(" Error fetching products:", error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
      if (categories.length === 0) fetchCategories();
    }
  }, [token, debouncedSearch, statusFilter, categoryFilter, currentPage, pageSize]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedProducts = products; // Already paginated from API

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

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map((p) => p.id));
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (active: boolean) => {
    if (selectedIds.length === 0) return;

    try {
      setIsBulkUpdating(true);
      await productService.bulkUpdateStatus(token!, selectedIds, active);

      setPopUpAlertData({
        isOpen: true,
        type: "success",
        message: `Successfully ${active ? 'activated' : 'deactivated'} ${selectedIds.length} products.`,
      });

      setSelectedIds([]);
      fetchProducts();
    } catch (error) {
      console.error("Bulk update error:", error);
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to update products.",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const formatGBP = (amount: number) =>
    new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);

  if (status === "loading" || initialLoading) return <SellerLoader />;


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

        {/* <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <button
            onClick={() => router.push("/seller/products/form")}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-[1.5rem] font-bold transition-all shadow-xl shadow-black/10 active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            Create Product
          </button>
        </div> */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Stock", value: apiStats.totalStock, icon: Package, color: "blue", suffix: " Units" },
          { label: "Total Sold", value: apiStats.totalSold, icon: ShoppingBag, color: "emerald", suffix: " Items" },
          { label: "Average Rating", value: apiStats.averageRating, icon: Star, color: "amber", suffix: " / 5.0" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-${stat.color}-500/5 rounded-full transition-transform group-hover:scale-150 duration-700`} />
            <div className="flex items-center gap-6 relative z-10">
              <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon size={28} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">
                  {stat.value}
                  <span className="text-sm font-bold text-gray-400 ml-1">{stat.suffix}</span>
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden relative">
        {/* Toolbar */}
        <div className="p-8 border-b border-gray-50 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
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

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${showFilters ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <Filter size={18} />
                Filters
                <ChevronDown size={16} className={`transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <div className="hidden lg:block h-8 w-px bg-gray-100 mx-2" />
              <div className="flex items-center gap-4 text-sm text-gray-400 font-bold uppercase tracking-widest">
                <span>Showing {paginatedProducts.length} of {totalCount} Results</span>
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-50 animate-fadeIn">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Live (Active)</option>
                  <option value="inactive">Draft (Inactive)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[var(--brand-primary)]/20 outline-none appearance-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setCategoryFilter("all");
                    setSearchTerm("");
                  }}
                  className="text-sm font-bold text-gray-400 hover:text-rose-500 transition-colors pb-3"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between bg-[var(--brand-primary)] text-white px-6 py-4 rounded-2xl animate-slideUp">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                  {selectedIds.length}
                </div>
                <span className="font-bold text-sm">Products Selected</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  disabled={isBulkUpdating}
                  onClick={() => handleBulkStatusUpdate(true)}
                  className="px-6 py-2 bg-white text-[var(--brand-primary)] rounded-xl font-bold text-sm hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <CheckCircle size={16} />
                  Activate
                </button>
                <button
                  disabled={isBulkUpdating}
                  onClick={() => handleBulkStatusUpdate(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 border border-white/20"
                >
                  <XCircle size={16} />
                  Deactivate
                </button>
                <div className="w-px h-6 bg-white/20 mx-2" />
                <button
                  onClick={() => setSelectedIds([])}
                  className="text-white/70 hover:text-white font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-6 px-8 w-12">
                  <div
                    onClick={handleSelectAll}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0
                      ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]"
                      : "border-gray-200 hover:border-[var(--brand-primary)]"
                      }`}
                  >
                    {selectedIds.length === paginatedProducts.length && paginatedProducts.length > 0 && <Check size={14} className="text-white" />}
                  </div>
                </th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Product Info</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Brand & Category</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Inventory Details</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Pricing</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Status</th>
                <th className="py-6 px-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && !initialLoading ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 border-4 border-[var(--brand-primary)]/20 border-t-[var(--brand-primary)] rounded-full animate-spin" />
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-widest animate-pulse">Syncing Inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedProducts.length > 0 ? (
                paginatedProducts.map((p, idx) => (
                  <tr key={p.id} className={`group hover:bg-gray-50/50 transition-all duration-300 ${selectedIds.includes(p.id) ? 'bg-gray-50/80' : ''}`}>
                    <td className="py-6 px-8">
                      <div
                        onClick={() => handleSelectOne(p.id)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all ${selectedIds.includes(p.id)
                          ? "bg-[var(--brand-primary)] border-[var(--brand-primary)]"
                          : "border-gray-200 hover:border-[var(--brand-primary)]"
                          }`}
                      >
                        {selectedIds.includes(p.id) && <Check size={14} className="text-white" />}
                      </div>
                    </td>
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
                          {/* Brand and categories */}


                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{p.id}</p>
                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md">
                              <Star size={10} fill="currentColor" className="text-amber-500" />
                              <span className="text-[10px] font-black text-amber-700">{p.averageRating}</span>
                              <span className="text-[8px] font-bold text-amber-400">({p.totalReviews})</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Tag size={12} className="text-blue-400" />
                          <span className="text-[10px] font-black uppercase tracking-wider">{p.brand?.name || "No Brand"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <AlertCircle size={12} className="text-gray-300" />
                          <span className="text-[10px] font-bold uppercase tracking-tight">{p.categories?.name || "General"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-8">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4 bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-50">
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-blue-500" />
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider">Stock</span>
                          </div>
                          <span className="text-sm font-black text-blue-600">{p.totalStock}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 bg-emerald-50/50 px-3 py-1.5 rounded-xl border border-emerald-50">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">Sold</span>
                          </div>
                          <span className="text-sm font-black text-emerald-600">{p.totalSold}</span>
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
                  <td colSpan={6} className="py-32 text-center">
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
        {!initialLoading && products.length > 0 && (
          <div className="p-8 bg-gray-50/30 border-t border-gray-50">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
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
