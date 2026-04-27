"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
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

import {
  GripVertical,
  MoreVertical,
  Pencil,
  Trash2,
  Search,
  Loader2,
} from "lucide-react";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface } from "@/lib/types";
import { categoryService } from "@/lib/services/categoryService";
import { submenuService } from "@/lib/services/submenuService";
import Loader from "@/components/Loader";

// Sortable Row Component
function SortableRow({
  category,
  idx,
  startIndex,
  openMenu,
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
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${
        idx % 2 === 0 ? "bg-gray-50" : "bg-white"
      } hover:bg-gray-100 transition ${isDragging ? "shadow-lg" : ""}`}
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
      <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
      <td className="py-3 px-3 text-center">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-10 h-10 object-cover rounded-md"
          />
        ) : (
          <span className="text-gray-400 text-xs italic">No Image</span>
        )}
      </td>
      <td className="py-3 px-3 font-medium text-gray-800">{category.name}</td>
      <td className="py-3 px-3 text-gray-600">{category.slug}</td>
      <td className="py-3 px-3 text-gray-700">
        {category.description ? category.description.substring(0, 50) + "..." : "-"}
      </td>
      <td className="py-3 px-3 text-center">
        <IconButton
          onClick={(e) => openMenu(e, category.id)}
          disabled={isReordering}
        >
          <MoreVertical size={18} />
        </IconButton>
      </td>
    </tr>
  );
}

export default function CategoriesReorderPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [categories, setCategories] = useState<any[]>([]);
  const [submenus, setSubmenus] = useState<any[]>([]);
  const [selectedSubmenuId, setSelectedSubmenuId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Auth guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace("/admin/login");
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace("/");
  }, [status, session, router]);

  // Fetch submenus
  const fetchSubmenus = useCallback(async () => {
    if (!token) return;
    try {
      const res: any = await submenuService.getAll(token);
      setSubmenus(res?.data || []);
    } catch {
      showAlert("error", "Failed to fetch submenus.");
    }
  }, [token]);

  // Fetch categories for selected submenu
  const fetchCategories = useCallback(async () => {
    if (!token || !selectedSubmenuId) {
      setCategories([]);
      return;
    }
    try {
      setLoading(true);
      const res: any = await categoryService.getAll(token, selectedSubmenuId);
      const sorted = (res?.data || []).sort(
        (a: any, b: any) => a.position - b.position
      );
      setCategories(sorted);
      setCurrentPage(1);
    } catch {
      showAlert("error", "Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  }, [token, selectedSubmenuId]);

  useEffect(() => {
    if (token) {
      fetchSubmenus();
    }
  }, [token, fetchSubmenus]);

  useEffect(() => {
    fetchCategories();
  }, [selectedSubmenuId, fetchCategories]);

  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedCategories = filteredCategories.slice(
    startIndex,
    startIndex + pageSize
  );

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !selectedSubmenuId) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    const activeIndex = categories.findIndex((c) => c.id === activeId);
    const overIndex = categories.findIndex((c) => c.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // Calculate new order
    const newOrder = arrayMove(categories, activeIndex, overIndex).map(
      (item, idx) => ({ id: item.id, position: idx })
    );

    // Re-sort the array based on new positions to ensure UI updates correctly
    const reorderedCategories = arrayMove(categories, activeIndex, overIndex).map((c, idx) => ({
      ...c,
      position: idx,
    }));

    setCategories(reorderedCategories);
    setIsReordering(true);

    try {
      const response = await categoryService.reorder(token!, {
        submenuId: selectedSubmenuId,
        items: newOrder,
      });

      if (response.success) {
        showAlert("success", "Order updated successfully!");
        const sorted = (response.data || []).sort(
          (a: any, b: any) => a.position - b.position
        );
        setCategories(sorted);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      showAlert("error", error.message || "Failed to update order. Reverting...");
      await fetchCategories();
    } finally {
      setIsReordering(false);
    }
  };

  const showAlert = (type: PopUpInterface["type"], message: string) => {
    setPopUpAlertData({
      isOpen: true,
      type,
      message,
      onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, categoryId: number) => {
    setMenuAnchor(e.currentTarget);
    setSelectedCategoryId(categoryId);
  };

  const closeMenu = () => setMenuAnchor(null);

  if (status === "loading" || (loading && selectedSubmenuId)) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Reorder Categories</h1>
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
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-4 py-3">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Select Submenu
          </label>
          <select
            value={selectedSubmenuId || ""}
            onChange={(e) => setSelectedSubmenuId(e.target.value ? Number(e.target.value) : null)}
            className="w-full max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select a Submenu --</option>
            {submenus.map((submenu: any) => (
              <option key={submenu.id} value={submenu.id}>
                {submenu.name}
              </option>
            ))}
          </select>
        </div>

        {selectedSubmenuId ? (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                  <tr>
                    <th className="py-3 px-3 text-center w-[50px]">Drag</th>
                    <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                    <th className="py-3 px-3 text-center">Image</th>
                    <th className="py-3 px-3 text-left">Name</th>
                    <th className="py-3 px-3 text-left">Slug</th>
                    <th className="py-3 px-3 text-left">Description</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCategories.length > 0 ? (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={paginatedCategories.map((c) => c.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {paginatedCategories.map((cat, idx) => (
                          <SortableRow
                            key={cat.id}
                            category={cat}
                            idx={idx}
                            startIndex={startIndex}
                            openMenu={openMenu}
                            isReordering={isReordering}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        {loading ? <Loader2 className="inline animate-spin" /> : "No categories found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredCategories.length}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setPageSize}
                />
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-gray-500">
            Select a submenu to view and reorder its categories.
          </div>
        )}
      </div>

      {/* Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem disabled>
          <ListItemText>Actions</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu} disabled>
          <ListItemIcon>
            <Pencil size={18} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={closeMenu} disabled>
          <ListItemIcon>
            <Pencil size={18} />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
      </Menu>

      {/* Alert */}
      {popUpAlertData.isOpen && (
        <PopupAlert
          type={popUpAlertData.type}
          message={popUpAlertData.message}
          onConfirm={popUpAlertData.onConfirm}
          onCancel={popUpAlertData.onCancel}
          show={popUpAlertData.isOpen}
        />
      )}
    </div>
  );
}
