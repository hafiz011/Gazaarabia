"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { useModalStore } from "@/lib/stores/modalStore";
import { PopUpInterface } from "@/lib/types";
import { subcategoryService, Subcategory } from "@/lib/services/subcategoryService";
import { categoryService, Category } from "@/lib/services/categoryService";

export default function SubcategoryListPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [formName, setFormName] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
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

  // 📥 Fetch subcategories & categories
  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  // 🔍 Fetch subcategories whenever search term changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchSubcategories(searchTerm);
    }, 300); // debounce for better UX
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    if (modalAction === "subcategory") {
      setFormName("");
      setFormCategoryId(null);
      setEditId(null);
      setIsEditing(false);
      setIsModalOpen(true);
      clearModal();
    }
  }, [modalAction, clearModal]);

  const fetchSubcategories = async (search?: string) => {
    try {
      setLoading(true);
      const response: any = await subcategoryService.getAll(search);
      if (Array.isArray(response)) {
        setSubcategories(response);
      } else if (Array.isArray(response?.data)) {
        setSubcategories(response.data);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch subcategories.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data: any = await categoryService.getAll();
      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray(data?.data)) setCategories(data.data);
      else setCategories([]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // 🧮 Pagination
  const totalPages = Math.ceil(subcategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubcategories = subcategories.slice(startIndex, startIndex + pageSize);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCategoryId) return;

    try {
      if (isEditing && editId) {
        await subcategoryService.update(editId, {
          name: formName,
          categoryId: formCategoryId,
        });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Subcategory updated successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        await subcategoryService.create({
          name: formName,
          categoryId: formCategoryId,
        });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Subcategory added successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      }
      setIsModalOpen(false);
      fetchSubcategories(searchTerm);
    } catch (err: any) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save subcategory.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setFormName(subcategory.name);
    setFormCategoryId(subcategory.categoryId);
    setEditId(subcategory.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this subcategory?",
      onConfirm: async () => {
        try {
          await subcategoryService.remove(id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Subcategory deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
            onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchSubcategories(searchTerm);
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete subcategory.",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
            onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* ✅ Header with search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Subcategories</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search category or subcategory..."
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
                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                <th className="py-3 px-3 text-center">Subcategory Name</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500 text-sm">
                    Loading subcategories...
                  </td>
                </tr>
              ) : paginatedSubcategories.length > 0 ? (
                paginatedSubcategories.map((sub, idx) => (
                  <tr
                    key={sub.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {sub.name}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {sub.category?.name || "-"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="p-1.5 text-[var(--brand-secondary)] hover:bg-gray-100 rounded-full"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
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
                    No subcategories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        {!loading && subcategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={subcategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

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
