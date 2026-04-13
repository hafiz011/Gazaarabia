"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, Trash2, X, Search } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { categoryService, Category } from "@/lib/services/categoryService";
import { useModalStore } from "@/lib/stores/modalStore";
import { PopUpInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { uploadService } from "@/lib/services/uploadService";
import { generateSlug } from "@/lib/utils";

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCommission, setFormCommission] = useState<number | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [categoryImage, setCategoryImage] = useState<string | null>(null);

  const [isSlugEdited, setIsSlugEdited] = useState(false);



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

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  //  Fetch categories
  useEffect(() => {
    if (token) fetchCategories();
  }, [token]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data: any = await categoryService.getAll(token!);
      setCategories(data?.data ?? null);
    } catch (error) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch categories.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  //  Reset modal state
  useEffect(() => {
    if (modalAction === "category") {
      setFormName("");
      setFormSlug("")
      setFormCommission("");
      setCategoryImage(null);
      setEditId(null);
      setIsEditing(false);
      setIsSlugEdited(false);
      setIsModalOpen(true);
      clearModal();
    }
  }, [modalAction, clearModal]);

  //  Filter + Paginate
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

  // Add / Update Category
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    if (!formSlug.trim()) return;


    if (!formSlug.trim()) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Category slug is required.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }

    // Length validation
    if (formSlug.length < 3 || formSlug.length > 100) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Slug must be between 3 and 100 characters.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }

    // Format validation
    if (!/^[a-z0-9-]+$/.test(formSlug)) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Slug can only contain lowercase letters, numbers and hyphens.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }


    // Image required check
    if (!categoryImage) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Category image is required.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    }


    try {
      if (isEditing && editId) {
        await categoryService.update(token!, editId, { name: formName, slug: formSlug, image: categoryImage, commission: formCommission === "" ? null : formCommission });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Category updated successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        await categoryService.create(token!, { name: formName, slug: formSlug, image: categoryImage, commission: formCommission === "" ? null : formCommission });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Category added successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save category.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };



  const handleImageUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadService.uploadImage(file, "categories");
    setCategoryImage(url);
  };


  // Edit
  const handleEdit = (category: any) => {
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormCommission(category.categoryCommission?.commission ?? "");
    setCategoryImage(category.image ?? null);
    setEditId(category.id);
    setIsEditing(true);
    setIsSlugEdited(true);
    setIsModalOpen(true);
  };

  //  Delete
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this category?",
      onConfirm: async () => {
        try {
          await categoryService.remove(token!, id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Category deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchCategories();
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete category.",
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
          <h1 className="text-xl font-semibold text-gray-800">Manage Categories</h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
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
                <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                <th className="py-3 px-3 text-center">Image</th>
                <th className="py-3 px-3 text-center">Category Name</th>
                <th className="py-3 px-3 text-center">Slug</th>
                <th className="py-3 px-3 text-center">Commission (%)</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCategories.length > 0 ? (
                paginatedCategories.map((cat, idx) => (
                  <tr
                    key={cat.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-14 h-14 object-cover rounded-md border"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs italic">No Image</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {cat.name}
                    </td>

                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {cat.slug}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {(cat as any).categoryCommission?.commission != null ? `${(cat as any).categoryCommission.commission}%` : "-"}
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
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*  Pagination */}
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

      {/*  Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
            <button
              onClick={() => { setIsModalOpen(false); setCategoryImage(null); }}
              className="absolute top-3 right-3 text-gray-500"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                value={formName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormName(value);

                  // ---- AUTO SLUG ----
                  if (!isSlugEdited) {
                    setFormSlug(generateSlug(value));
                  }
                }}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="e.g. T-Shirts"
              />


              <label className="block mb-2 text-sm font-medium text-gray-700">
                Category Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={formSlug}
                onChange={(e) => {
                  setIsSlugEdited(true);
                  setFormSlug(generateSlug(e.target.value)); // clean slug
                }}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="e.g. t-shirts"
              />

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Commission (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formCommission}
                onChange={(e) => setFormCommission(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="e.g. 5"
              />

              {/* Category Image Upload */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Category Image
                </label>

                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  ref={fileRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div
                  className="relative w-28 h-28 rounded-lg overflow-hidden border bg-gray-50 cursor-pointer hover:border-[var(--brand-primary)] transition"
                  onClick={() => fileRef.current?.click()}
                >
                  {/* If no image, show placeholder */}
                  {!categoryImage ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      Upload
                    </div>
                  ) : (
                    <img
                      src={categoryImage}
                      alt="category"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Remove button when image is present */}
                  {categoryImage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent triggering upload
                        setCategoryImage(null);
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setCategoryImage(null); }}
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

      {/* Popup Alert */}
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
