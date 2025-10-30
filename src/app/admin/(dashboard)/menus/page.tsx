"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { GripVertical, MoreVertical, Pencil, Trash2, Search } from "lucide-react";
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
import { menuService } from "@/lib/services/menuService";
import Loader from "@/components/Loader";

function SortableRow({ menu, idx, startIndex, openMenu }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: menu.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition`}
    >
      <td className="py-3 px-3 text-center w-[50px]" {...attributes} {...listeners}>
        <GripVertical className="text-gray-400 cursor-grab" />
      </td>
      <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
      <td className="py-3 px-3 font-medium text-gray-800">{menu.name}</td>
      <td className="py-3 px-3 text-gray-600">{menu.slug}</td>
      <td className="py-3 px-3 text-gray-700 capitalize">{menu.type}</td>
      <td className="py-3 px-3 text-gray-500 text-xs">
        {new Date(menu.createdAt).toLocaleDateString()}
      </td>
      <td className="py-3 px-3 text-center">
        <IconButton onClick={(e) => openMenu(e, menu.id)}>
          <MoreVertical size={18} />
        </IconButton>
      </td>
    </tr>
  );
}

export default function MenusListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [menus, setMenus] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedMenuId, setSelectedMenuId] = useState<number | null>(null);
  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const sensors = useSensors(useSensor(PointerSensor));

  //  Fetch menus
  const fetchMenus = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res: any = await menuService.getAll(token);
      const sorted = (res?.data || []).sort((a: any, b: any) => a.position - b.position);
      setMenus(sorted);
    } catch {
      showAlert("error", "Failed to fetch menus.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  const filteredMenus = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return menus.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.slug.toLowerCase().includes(term) ||
        m.type.toLowerCase().includes(term)
    );
  }, [menus, searchTerm]);

  //  Drag & Drop
  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = menus.findIndex((m) => m.id === active.id);
    const newIndex = menus.findIndex((m) => m.id === over.id);
    const reordered = arrayMove(menus, oldIndex, newIndex);
    setMenus(reordered);

    await fetch("/api/menus/reorder", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderedIds: reordered.map((m) => m.id) }),
    });
  };

  //  Delete
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this menu?",
      onConfirm: async () => {
        try {
          await menuService.remove(token!, id);
          showAlert("success", "Menu deleted successfully!");
          fetchMenus();
        } catch (err: any) {
          showAlert("error", err.message || "Failed to delete menu.");
        }
      },
      onCancel: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };

  const showAlert = (type: "success" | "error", message: string) => {
    setPopUpAlertData({
      isOpen: true,
      type,
      message,
      onConfirm: () => setPopUpAlertData((p) => ({ ...p, isOpen: false })),
    });
  };

  const openMenu = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMenuId(id);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setSelectedMenuId(null);
  };

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/*  Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Menus</h1>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 text-sm 
                         focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
            />
          </div>
        </div>

        <div className="border-t border-gray-200"></div>

        {/*  Table with Drag & Drop */}
        <div className="overflow-x-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={menus} strategy={verticalListSortingStrategy}>
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 text-xs uppercase font-medium">
                  <tr>
                    <th className="py-3 px-3 w-[50px]"></th>
                    <th className="py-3 px-3 text-center w-[60px]">Sn.</th>
                    <th className="py-3 px-3 text-left">Menu Name</th>
                    <th className="py-3 px-3 text-left">Slug</th>
                    <th className="py-3 px-3 text-left">Type</th>
                    <th className="py-3 px-3 text-left w-[160px]">Created At</th>
                    <th className="py-3 px-3 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menus.length > 0 ? (
                    menus.map((menu, idx) => (
                      <SortableRow
                        key={menu.id}
                        menu={menu}
                        idx={idx}
                        startIndex={0}
                        openMenu={openMenu}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                        No menus found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </SortableContext>
          </DndContext>
        </div>
      </div>

      {/* ⋮ Menu actions */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            router.push(`/admin/menus/form/${selectedMenuId}`);
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
            if (selectedMenuId) handleDelete(selectedMenuId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Trash2 size={18} color="var(--brand-primary)" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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
