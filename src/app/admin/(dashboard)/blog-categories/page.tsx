"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { blogCategoryService, BlogCategory } from "@/lib/services/blogCategoryService";
import { useModalStore } from "@/lib/stores/modalStore";
import { PopUpInterface } from "@/lib/types";
import TextField from "@mui/material/TextField"; // ✅ MUI input

export default function BlogCategoriesPage() {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
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

  // 📥 Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (modalAction === "blog-category") {
      setFormName("");
      setFormSlug("");
      setEditId(null);
      setIsEditing(false);
      setIsModalOpen(true);
      clearModal();
    }
  }, [modalAction, clearModal]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await blogCategoryService.getAll();
      setCategories(data);
    } catch (error) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch blog categories.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
        onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Filter + Paginate
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + pageSize
  );

  // 📝 Add / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) return;

    try {
      if (isEditing && editId) {
        await blogCategoryService.update(editId, { name: formName, slug: formSlug });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Category updated successfully!",
          onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
        });
      } else {
        await blogCategoryService.create({ name: formName, slug: formSlug });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Category added successfully!",
          onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save category.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
        onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }
  };

  // ✏️ Edit
  const handleEdit = (category: BlogCategory) => {
    setFormName(category.name);
    setFormSlug(category.slug);
    setEditId(category.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // 🗑️ Delete
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this category?",
      onConfirm: async () => {
        try {
          await blogCategoryService.remove(id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Category deleted successfully!",
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
            onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          });
          fetchCategories();
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete category.",
            onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
            onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* ✅ Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Blog Categories</h1>
          <div className="relative w-full sm:w-72" suppressHydrationWarning>
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <TextField
              id="blog-category-search"
              required
              fullWidth
              size="small"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                sx: { pl: 4 }, // padding left to align with icon
              }}
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* ✅ Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
              <tr>
                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                <th className="py-3 px-3 text-center">Name</th>
                <th className="py-3 px-3 text-center">Slug</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                    Loading categories...
                  </td>
                </tr>
              ) : paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {cat.name}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800">{cat.slug}</td>
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
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        {!loading && filteredCategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredCategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* 🪄 Modal */}
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
              {isEditing ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                id="blog-category-name"
                required
                label="Name"
                fullWidth
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <TextField
                id="blog-category-slug"
                required
                label="Slug"
                fullWidth
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
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

      {/* ✅ Popup Alert */}
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
