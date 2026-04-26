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
import { submenuService } from "@/lib/services/submenuService";
import Loader from "@/components/Loader";

// Sortable Row Component
function SortableRow({
  submenu,
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
    id: submenu.id,
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
      <td className="py-3 px-3 font-medium text-gray-800">{submenu.name}</td>
      <td className="py-3 px-3 text-gray-600">{submenu.slug}</td>
      <td className="py-3 px-3 text-gray-700">
        {submenu.menu ? (
          submenu.menu.name
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>
      <td className="py-3 px-3 text-gray-700">
        {submenu.category ? (
          submenu.category.name
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>
      <td className="py-3 px-3 text-gray-500 text-xs">
        {new Date(submenu.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 px-3 text-center">
        <IconButton
          onClick={(e) => openMenu(e, submenu.id)}
          disabled={isReordering}
        >
          <MoreVertical size={18} />
        </IconButton>
      </td>
    </tr>
  );
}

export default function SubmenusListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [submenus, setSubmenus] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedSubmenuId, setSelectedSubmenuId] = useState<number | null>(null);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  // const sensors = useSensors(useSensor(PointerSensor));


  // Fetch submenus
  const fetchSubmenus = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res: any = await submenuService.getAll(token);
      const sorted = (res?.data || []).sort(
        (a: any, b: any) => a.position - b.position
      );
      setSubmenus(sorted);
    } catch {
      showAlert("error", "Failed to fetch submenus.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSubmenus();
  }, [fetchSubmenus]);

  const filteredSubmenus = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return submenus.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.slug.toLowerCase().includes(term) ||
        s.menu?.name?.toLowerCase().includes(term) ||
        s.category?.name?.toLowerCase().includes(term)
    );
  }, [submenus, searchTerm]);

  // Group by menu for drag & drop
  const groupedByMenu = useMemo(() => {
    const grouped: { [key: number]: any[] } = {};
    filteredSubmenus.forEach((submenu) => {
      const menuId = submenu.menuId;
      if (!grouped[menuId]) grouped[menuId] = [];
      grouped[menuId].push(submenu);
    });
    return grouped;
  }, [filteredSubmenus]);

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = Number(active.id);
    const overId = Number(over.id);

    if (activeId === overId) return;

    // Find which menu the item belongs to
    let menuId: number | null = null;
    let activeIndex = -1;
    let overIndex = -1;
    let menuItems: any[] = [];

    for (const [mId, items] of Object.entries(groupedByMenu)) {
      const activeIdx = items.findIndex((item) => Number(item.id) === activeId);
      const overIdx = items.findIndex((item) => Number(item.id) === overId);

      if (activeIdx !== -1 || overIdx !== -1) {
        menuId = Number(mId);
        menuItems = items;
        activeIndex = activeIdx !== -1 ? activeIdx : activeIndex;
        overIndex = overIdx !== -1 ? overIdx : overIndex;
        break;
      }
    }

    if (menuId === null || activeIndex === -1 || overIndex === -1) return;

    // Calculate new order
    const newOrder = arrayMove(menuItems, activeIndex, overIndex).map(
      (item, idx) => ({ id: item.id, position: idx })
    );

    // Optimistically update UI
    const optimisticSubmenus = submenus.map((s) => {
      const reorderedItem = newOrder.find((item) => item.id === s.id);
      if (reorderedItem) return { ...s, position: reorderedItem.position };
      return s;
    });

    setSubmenus(optimisticSubmenus);
    setIsReordering(true);

    try {
      // Call reorder API
      const response = await submenuService.reorder(token!, menuId, newOrder);

      if (response.success) {
        showAlert("success", "Order updated successfully!");
        // Update with server response to ensure consistency
        const sorted = (response.data || []).sort(
          (a: any, b: any) => a.position - b.position
        );
        setSubmenus(sorted);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      // Rollback on error
      showAlert("error", error.message || "Failed to update order. Reverting...");
      await fetchSubmenus();
    } finally {
      setIsReordering(false);
    }
  };

  // Delete handler
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this submenu?",
      onConfirm: async () => {
        try {
          await submenuService.remove(token!, id);
          showAlert("success", "Submenu deleted successfully!");
          fetchSubmenus();
        } catch (err: any) {
          showAlert("error", err.message || "Failed to delete submenu.");
        }
      },
      onCancel: () =>
        setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };

  const showAlert = (
    type: "success" | "error",
    message: string
  ) => {
    setPopUpAlertData({
      isOpen: true,
      type,
      message,
      onConfirm: () =>
        setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchor(event.currentTarget);
    setSelectedSubmenuId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setSelectedSubmenuId(null);
  };

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-800">
              Manage Submenus
            </h1>
            {isReordering && (
              <Loader2 size={18} className="animate-spin text-blue-500" />
            )}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search submenus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
              disabled={isReordering}
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/* Sortable Table */}
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredSubmenus.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                  <tr>
                    <th className="py-3 px-3 w-[50px]"></th>
                    <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                    <th className="py-3 px-3 text-left">Name</th>
                    <th className="py-3 px-3 text-left">Slug</th>
                    <th className="py-3 px-3 text-left">Parent Menu</th>
                    <th className="py-3 px-3 text-left">Position</th>
                    <th className="py-3 px-3 text-left w-[160px]">
                      Created At
                    </th>
                    <th className="py-3 px-3 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmenus.length > 0 ? (
                    filteredSubmenus.map((submenu, idx) => (
                      <SortableRow
                        key={submenu.id}
                        submenu={submenu}
                        idx={idx}
                        startIndex={0}
                        openMenu={openMenu}
                        isReordering={isReordering}
                      />
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-12 text-center text-gray-500 text-sm"
                      >
                        No submenus found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* ⋮ Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            router.push(`/admin/submenus/form/${selectedSubmenuId}`);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Pencil size={18} color="var(--brand-secondary)" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedSubmenuId) handleDelete(selectedSubmenuId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Trash2 size={18} color="var(--brand-primary)" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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
