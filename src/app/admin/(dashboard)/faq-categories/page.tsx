"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { faqCategoryService, FaqCategory } from "@/lib/services/faqCategoryService";
import { useModalStore } from "@/lib/stores/modalStore";
import { PopUpInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";

export default function FaqCategoryListPage() {
  const [faqCategories, setFaqCategories] = useState<FaqCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const modalAction = useModalStore((state) => state.action);
  const clearModal = useModalStore((state) => state.clearModal);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
    onConfirm: undefined,
    onCancel: undefined,
  });

  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const router = useRouter();

  //  Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  //  Fetch FAQ categories
  useEffect(() => {
    if (token) fetchFaqCategories();
  }, [token]);

  const fetchFaqCategories = async () => {
    try {
      setLoading(true);
      const data: any = await faqCategoryService.getAll(token!);
      setFaqCategories(data?.data ?? []);
    } catch (error) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch FAQ categories.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  //  Reset modal state
  useEffect(() => {
    if (modalAction === "faq-category") {
      setFormName("");
      setFormSlug("");
      setEditId(null);
      setIsEditing(false);
      setIsModalOpen(true);
      clearModal();
    }
  }, [modalAction, clearModal]);

  //  Filter + Paginate
  const filteredFaqCategories = useMemo(() => {
    return faqCategories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [faqCategories, searchTerm]);

  const totalPages = Math.ceil(filteredFaqCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedFaqCategories = filteredFaqCategories.slice(
    startIndex,
    startIndex + pageSize
  );

  //  Add / Update FAQ Category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) return;

    try {
      if (isEditing && editId) {
        await faqCategoryService.update(token!, editId, {
          name: formName,
          slug: formSlug,
        });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "FAQ Category updated successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        await faqCategoryService.create(token!, { name: formName, slug: formSlug });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "FAQ Category added successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      }
      setIsModalOpen(false);
      fetchFaqCategories();
    } catch (err: any) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save FAQ category.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  //  Edit
  const handleEdit = (category: FaqCategory) => {
    setFormName(category.name);
    setFormSlug(category.slug);
    setEditId(category.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  //  Delete
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this FAQ category?",
      onConfirm: async () => {
        try {
          await faqCategoryService.remove(token!, id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "FAQ Category deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchFaqCategories();
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete FAQ category.",
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
        {/*  Header with search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage FAQ Categories</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQ categories..."
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
                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                <th className="py-3 px-3 text-center">Category Name</th>
                <th className="py-3 px-3 text-center">Slug</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFaqCategories.length > 0 ? (
                paginatedFaqCategories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {cat.name}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-1.5 text-[var(--brand-secondary)] hover:bg-gray-100 rounded-full"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
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
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                    No FAQ categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*  Pagination */}
        {!loading && filteredFaqCategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredFaqCategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/*  Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit FAQ Category" : "Add FAQ Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="e.g. Shipping"
              />

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Category Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="e.g. shipping"
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)]"
                >
                  {isEditing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/*  Popup Alert */}
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
