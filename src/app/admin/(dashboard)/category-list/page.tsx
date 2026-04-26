"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2, X, Search, GripVertical, Loader2 } from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { categoryService, Category } from "@/lib/services/categoryService";
import { submenuService } from "@/lib/services/submenuService";
import { useModalStore } from "@/lib/stores/modalStore";
import { PopUpInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { uploadService } from "@/lib/services/uploadService";
import { generateSlug } from "@/lib/utils";

// Sortable Row Component
function SortableRow({
  cat,
  idx,
  startIndex,
  handleEdit,
  handleDelete,
  isReordering,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: cat.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} 
        hover:bg-gray-100 transition ${isDragging ? "shadow-lg" : ""}`}
    >
      <td
        className="py-3 px-3 text-center w-[50px]"
        {...attributes}
        {...listeners}
      >
        <GripVertical
          className={`${
            isReordering ? "text-gray-400 cursor-not-allowed" : "text-gray-400 cursor-grab"
          } hover:text-gray-600`}
          size={18}
        />
      </td>
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
        <div className="flex flex-col">
          <span>{cat.name}</span>
          {cat.submenu && (
            <span className="text-[10px] text-gray-500 font-normal">
              ({cat.submenu.name} - {cat.submenu.menu?.name || "N/A"})
            </span>
          )}
        </div>
      </td>

      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {cat.slug}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {cat.description || "-"}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {(cat as any).categoryCommission?.commission != null
          ? `${(cat as any).categoryCommission.commission}%`
          : "-"}
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
            className="p-1.5 text-[var(--brand-primary)] hover:bg-red-50 rounded-full"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [filterSubmenuId, setFilterSubmenuId] = useState<number | "">("");

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCommission, setFormCommission] = useState<number | "">("");
  const [formDescription, setFormDescription] = useState("");
  const [formSubmenuId, setFormSubmenuId] = useState<number | "">("");
  const [submenus, setSubmenus] = useState<any[]>([]);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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
      const sorted = (data?.data ?? []).sort((a: any, b: any) => {
        if (a.submenuId !== b.submenuId) {
          return (a.submenuId || 0) - (b.submenuId || 0);
        }
        return a.position - b.position;
      });
      setCategories(sorted);
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

  // Fetch submenus
  useEffect(() => {
    if (token) {
      submenuService.getAll(token).then((res: any) => {
        setSubmenus(res?.data ?? []);
      }).catch(() => {
        setSubmenus([]);
      });
    }
  }, [token]);

  //  Reset modal state
  useEffect(() => {
    if (modalAction === "category") {
      setFormName("");
      setFormSlug("")
      setFormCommission("");
      setFormDescription("");
      setFormSubmenuId("");
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
    return categories.filter((cat) => {
      const matchSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchSubmenu = filterSubmenuId === "" || cat.submenuId === (filterSubmenuId === 0 ? null : Number(filterSubmenuId));
      return matchSearch && matchSubmenu;
    });
  }, [categories, searchTerm, filterSubmenuId]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + pageSize
  );

  // Group by Submenu for drag & drop
  const groupedBySubmenu = useMemo(() => {
    const grouped: { [key: number]: any[] } = {};
    filteredCategories.forEach((cat) => {
      const sId = cat.submenuId || 0; // 0 for categories with no submenu
      if (!grouped[sId]) grouped[sId] = [];
      grouped[sId].push(cat);
    });
    return grouped;
  }, [filteredCategories]);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);
    if (activeId === overId) return;

    // Find which submenu group the item belongs to
    let submenuId: number | null = null;
    let activeIndex = -1;
    let overIndex = -1;
    let groupItems: any[] = [];

    for (const [sId, items] of Object.entries(groupedBySubmenu)) {
      const aIdx = items.findIndex((item) => Number(item.id) === activeId);
      const oIdx = items.findIndex((item) => Number(item.id) === overId);

      if (aIdx !== -1 || oIdx !== -1) {
        submenuId = Number(sId);
        groupItems = items;
        activeIndex = aIdx !== -1 ? aIdx : activeIndex;
        overIndex = oIdx !== -1 ? oIdx : overIndex;
        break;
      }
    }

    if (activeIndex === -1 || overIndex === -1) return;

    // Calculate new order
    const newOrder = arrayMove(groupItems, activeIndex, overIndex).map(
      (item, idx) => ({ id: item.id, position: idx })
    );

    // Re-sort the array based on new positions to ensure UI updates correctly
    const reorderedCategories = arrayMove(groupItems, activeIndex, overIndex).map((c, idx) => ({
      ...c,
      position: idx,
    }));

    // Update the main categories list with reordered items
    setCategories((prev) => {
      const others = prev.filter((c) => (c.submenuId || 0) !== (submenuId || 0));
      const merged = [...others, ...reorderedCategories].sort((a: any, b: any) => {
        if (a.submenuId !== b.submenuId) {
          return (a.submenuId || 0) - (b.submenuId || 0);
        }
        return a.position - b.position;
      });
      return merged;
    });

    setIsReordering(true);

    try {
      const response: any = await categoryService.reorder(token!, {
        submenuId: submenuId || 0,
        items: newOrder,
      });

      if (response.success) {
        // fetchCategories(); // Refresh to be safe or use response data
        const serverData = response.data || [];
        setCategories((prev) => {
          const others = prev.filter((c) => (c.submenuId || 0) !== (submenuId || 0));
          const merged = [...others, ...serverData].sort((a: any, b: any) => {
            if (a.submenuId !== b.submenuId) {
              return (a.submenuId || 0) - (b.submenuId || 0);
            }
            return a.position - b.position;
          });
          return merged;
        });
      }
    } catch (err: any) {
      console.error("Reorder error:", err);
      fetchCategories(); // Rollback
    } finally {
      setIsReordering(false);
    }
  };

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
        await categoryService.update(token!, editId, {
          name: formName,
          slug: formSlug,
          image: categoryImage,
          commission: formCommission === "" ? null : formCommission,
          description: formDescription || null,
          submenuId: formSubmenuId === "" ? null : Number(formSubmenuId)
        });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Category updated successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        await categoryService.create(token!, {
          name: formName,
          slug: formSlug,
          image: categoryImage,
          commission: formCommission === "" ? null : formCommission,
          description: formDescription || null,
          submenuId: formSubmenuId === "" ? null : Number(formSubmenuId)
        });
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
    setFormDescription(category.description ?? "");
    setFormSubmenuId(category.submenuId ?? "");
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">
              Manage Categories
            </h1>
            {isReordering && (
              <Loader2 size={18} className="animate-spin text-blue-500" />
            )}
          </div>
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

          <div className="w-full sm:w-64">
            <select
              value={filterSubmenuId}
              onChange={(e) => {
                setFilterSubmenuId(e.target.value === "" ? "" : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            >
              <option value="">-- Filter by Submenu --</option>
              <option value="0">No Submenu</option>
              {submenus.map((submenu: any) => (
                <option key={submenu.id} value={submenu.id}>
                  {submenu.name} - {submenu.menu?.name || "N/A"}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Table */}
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                <tr>
                  <th className="py-3 px-3 text-center w-[50px]">Drag</th>
                  <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                  <th className="py-3 px-3 text-center">Image</th>
                  <th className="py-3 px-3 text-center">Category Name</th>
                  <th className="py-3 px-3 text-center">Slug</th>
                  <th className="py-3 px-3 text-center">Description</th>
                  <th className="py-3 px-3 text-center">Commission (%)</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={paginatedCategories.map((cat) => cat.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {paginatedCategories.length > 0 ? (
                    paginatedCategories.map((cat, idx) => (
                      <SortableRow
                        key={cat.id}
                        cat={cat}
                        idx={idx}
                        startIndex={startIndex}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        isReordering={isReordering}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-gray-500 text-sm"
                      >
                        No categories found
                      </td>
                    </tr>
                  )}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
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

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="Enter category description..."
                rows={4}
              />

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Assign to Submenu
              </label>
              <select
                value={formSubmenuId}
                onChange={(e) => setFormSubmenuId(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option value="">-- No Submenu (Optional) --</option>
                {submenus.map((submenu: any) => (
                  <option key={submenu.id} value={submenu.id}>
                    {submenu.name} - {submenu.menu?.name || "N/A"}
                  </option>
                ))}
              </select>

              {/* Display Selected Submenu Info */}
              {formSubmenuId && (
                <div className="bg-blue-50 border border-blue-200 rounded px-3 py-3 mb-4">
                  <p className="text-sm font-semibold text-blue-900">
                    {(() => {
                      const selected = submenus.find((s: any) => s.id === formSubmenuId);
                      const submenuName = selected?.name || "N/A";
                      const menuName = selected?.menu?.name || "N/A";
                      return `${submenuName} - ${menuName}`;
                    })()}
                  </p>
                </div>
              )}

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
