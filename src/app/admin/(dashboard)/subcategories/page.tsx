"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
import { useModalStore } from "@/lib/stores/modalStore";
import { PopUpInterface } from "@/lib/types";
import { subcategoryService, Subcategory } from "@/lib/services/subcategoryService";
import { categoryService, Category } from "@/lib/services/categoryService";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { generateSlug } from "@/lib/utils";

// Sortable Row Component
function SortableRow({
  sub,
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
    id: sub.id,
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
          className={`${isReordering ? "text-gray-400 cursor-not-allowed" : "text-gray-400 cursor-grab"
            } hover:text-gray-600`}
          size={18}
        />
      </td>
      <td className="py-3 px-3 text-center text-gray-600">
        {startIndex + idx + 1}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {sub.name}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {sub.slug}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {sub.category?.name || "-"}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {sub.description || "-"}
      </td>
      <td className="py-3 px-3 text-center text-gray-800 font-medium">
        {(sub as any).subcategoryCommission?.[0]?.commission != null
          ? `${(sub as any).subcategoryCommission[0].commission}%`
          : "-"}
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

export default function SubcategoryListPage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [filterCategoryId, setFilterCategoryId] = useState<number | "">("");

  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);


  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formCategoryId, setFormCategoryId] = useState<number | null>(null);
  const [formCommission, setFormCommission] = useState<number | "">("");
  const [formDescription, setFormDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const modalAction = useModalStore((state) => state.action);
  const clearModal = useModalStore((state) => state.clearModal);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const router = useRouter();

  // Auth Guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  // Fetch data
  useEffect(() => {
    if (token) {
      fetchSubcategories();
      fetchCategories();
    }
  }, [token]);

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (token) fetchSubcategories(searchTerm);
  //   }, 300);
  //   return () => clearTimeout(timeout);
  // }, [searchTerm, token]);

  useEffect(() => {
    if (!token) return;

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      fetchSubcategories(searchTerm);
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    if (modalAction === "subcategory") {
      setFormName("");
      setFormSlug("");
      setFormCategoryId(null);
      setFormCommission("");
      setFormDescription("");
      setEditId(null);
      setIsEditing(false);
      setIsSlugEdited(false);
      setIsModalOpen(true);
      clearModal();
    }
  }, [modalAction, clearModal]);

  const fetchSubcategories = async (search?: string) => {
    try {
      setLoading(true);
      const response: any = await subcategoryService.getAll(token!, search);
      if (Array.isArray(response)) {
        setSubcategories(response.sort((a: any, b: any) => {
          if (a.categoryId !== b.categoryId) return (a.categoryId || 0) - (b.categoryId || 0);
          return a.position - b.position;
        }));
      } else if (Array.isArray(response?.data)) {
        setSubcategories(response.data.sort((a: any, b: any) => {
          if (a.categoryId !== b.categoryId) return (a.categoryId || 0) - (b.categoryId || 0);
          return a.position - b.position;
        }));
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch subcategories.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data: any = await categoryService.getAll(token!);
      if (Array.isArray(data)) setCategories(data);
      else if (Array.isArray(data?.data)) setCategories(data.data);
      else setCategories([]);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  // Filter & Paginate
  const filteredSubcategories = useMemo(() => {
    return subcategories.filter((sub) => {
      const matchSearch =
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.category?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = filterCategoryId === "" || sub.categoryId === Number(filterCategoryId);
      return matchSearch && matchCategory;
    });
  }, [subcategories, searchTerm, filterCategoryId]);

  const totalPages = Math.ceil(filteredSubcategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedSubcategories = filteredSubcategories.slice(
    startIndex,
    startIndex + pageSize
  );

  // Group by Category for drag & drop
  const groupedByCategory = useMemo(() => {
    const grouped: { [key: number]: any[] } = {};
    subcategories.forEach((sub) => {
      const cId = sub.categoryId || 0;
      if (!grouped[cId]) grouped[cId] = [];
      grouped[cId].push(sub);
    });
    return grouped;
  }, [subcategories]);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);
    if (activeId === overId) return;

    // Find group
    let categoryId: number | null = null;
    let activeIndex = -1;
    let overIndex = -1;
    let groupItems: any[] = [];

    for (const [cId, items] of Object.entries(groupedByCategory)) {
      const aIdx = items.findIndex((item) => Number(item.id) === activeId);
      const oIdx = items.findIndex((item) => Number(item.id) === overId);

      if (aIdx !== -1 || oIdx !== -1) {
        categoryId = Number(cId);
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
    const reorderedSubcategories = arrayMove(groupItems, activeIndex, overIndex).map((s, idx) => ({
      ...s,
      position: idx,
    }));

    // Update the main subcategories list with reordered items
    setSubcategories((prev) => {
      const others = prev.filter((s) => (s.categoryId || 0) !== (categoryId || 0));
      const merged = [...others, ...reorderedSubcategories].sort((a: any, b: any) => {
        if (a.categoryId !== b.categoryId) return (a.categoryId || 0) - (b.categoryId || 0);
        return a.position - b.position;
      });
      return merged;
    });

    setIsReordering(true);

    try {
      const response: any = await subcategoryService.reorder(token!, {
        categoryId: categoryId || 0,
        items: newOrder,
      });

      if (response.success) {
        const serverData = response.data || [];
        setSubcategories((prev) => {
          const others = prev.filter((s) => (s.categoryId || 0) !== (categoryId || 0));
          const merged = [...others, ...serverData].sort((a: any, b: any) => {
            if (a.categoryId !== b.categoryId) return (a.categoryId || 0) - (b.categoryId || 0);
            return a.position - b.position;
          });
          return merged;
        });
      }
    } catch (err: any) {
      console.error("Reorder error:", err);
      fetchSubcategories(searchTerm);
    } finally {
      setIsReordering(false);
    }
  };

  // Add / Update Subcategory
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim() || !formCategoryId || !token) return;

    if (!formSlug.trim()) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Slug is required.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }

    if (formSlug.length < 3 || formSlug.length > 100) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Slug must be between 3 and 100 characters.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }

    if (!/^[a-z0-9-]+$/.test(formSlug)) {
      return setPopUpAlertData({
        isOpen: true,
        type: "error",
        message:
          "Slug can only contain lowercase letters, numbers and hyphens.",
        onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
      });
    }


    try {
      if (isEditing && editId) {
        await subcategoryService.update(token, editId, {
          name: formName,
          slug: formSlug,
          categoryId: formCategoryId,
          commission: formCommission === "" ? null : formCommission,
          description: formDescription || null
        });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Subcategory updated successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        await subcategoryService.create(token, {
          name: formName,
          slug: formSlug,
          categoryId: formCategoryId,
          commission: formCommission === "" ? null : formCommission,
          description: formDescription || null
        });
        setPopUpAlertData({
          isOpen: true,
          type: "success",
          message: "Subcategory added successfully!",
          onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
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
      });
    }
  };

  const handleEdit = (subcategory: any) => {
    setFormName(subcategory.name);
    setFormSlug(subcategory.slug);
    setFormCategoryId(subcategory.categoryId);
    setFormCommission(subcategory.subcategoryCommission?.[0]?.commission ?? "");
    setFormDescription(subcategory.description ?? "");
    setEditId(subcategory.id);
    setIsEditing(true);
    setIsSlugEdited(true); // stop auto
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this subcategory?",
      onConfirm: async () => {
        try {
          await subcategoryService.remove(token!, id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Subcategory deleted successfully!",
            onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchSubcategories(searchTerm);
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete subcategory.",
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
        {/* Header with search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">
              Manage Subcategories
            </h1>
            {isReordering && (
              <Loader2 size={18} className="animate-spin text-blue-500" />
            )}
          </div>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search category or subcategory..."
              value={searchTerm}
              onChange={(e) => {
                setCurrentPage(1);
                setSearchTerm(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={filterCategoryId}
              onChange={(e) => {
                setFilterCategoryId(e.target.value === "" ? "" : Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            >
              <option value="">-- Filter by Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
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
                  <th className="py-3 px-3 text-center">Subcategory Name</th>
                  <th className="py-3 px-3 text-center">Slug</th>
                  <th className="py-3 px-3 text-center">Category</th>
                  <th className="py-3 px-3 text-center">Description</th>
                  <th className="py-3 px-3 text-center">Commission (%)</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <SortableContext
                  items={paginatedSubcategories.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {paginatedSubcategories.length > 0 ? (
                    paginatedSubcategories.map((sub, idx) => (
                      <SortableRow
                        key={sub.id}
                        sub={sub}
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
                        No subcategories found
                      </td>
                    </tr>
                  )}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
        </div>

        {/* Pagination */}
        {!loading && filteredSubcategories.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSubcategories.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/*  Modal for Add/Edit Subcategory */}
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
              {isEditing ? "Edit Subcategory" : "Add Subcategory"}
            </h2>
            <form onSubmit={handleSubmit}>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Subcategory Name <span className="text-red-500">*</span>
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
                placeholder="e.g. Men's Wear"
              />

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                value={formSlug}
                onChange={(e) => {
                  setIsSlugEdited(true);
                  setFormSlug(generateSlug(e.target.value));
                }}
                className="w-full border rounded px-3 py-2 mb-4"
                placeholder="e.g. Men's Wear"
              />

              <label className="block mb-2 text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formCategoryId ?? ""}
                onChange={(e) => setFormCategoryId(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 mb-4"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

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
                placeholder="Enter subcategory description..."
                rows={4}
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
