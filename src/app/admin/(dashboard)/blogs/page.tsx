"use client";

import { useEffect, useMemo, useState } from "react";
import { MoreVertical, Pencil, Trash2, Search } from "lucide-react";
import TextField from "@mui/material/TextField";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { blogService } from "@/lib/services/blogService";
import { PopUpInterface, Blog } from "@/lib/types";
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function BlogListPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBlogId, setSelectedBlogId] = useState<number | null>(null);

  // 🛡️ Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.token) fetchBlogs();
  }, [session?.user?.token]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const data :any = await blogService.getAll(session?.user?.token as string);
      setBlogs(data?.data ?? null);
    } catch {
      showAlert("error", "Failed to fetch blogs.");
    } finally {
      setLoading(false);
    }
  };

  // 🧮 Filter + Paginate
  const filteredBlogs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.title.toLowerCase().includes(term) ||
        blog.slug.toLowerCase().includes(term) ||
        blog.content.toLowerCase().includes(term)
    );
  }, [blogs, searchTerm]);

  const totalPages = Math.ceil(filteredBlogs.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + pageSize);

  // 🗑️ Delete blog
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this blog?",
      onConfirm: async () => {
        try {
          await blogService.remove(session?.user?.token as string, id);
          showAlert("success", "Blog deleted successfully!");
          fetchBlogs();
        } catch (err: any) {
          showAlert("error", err.message || "Failed to delete blog.");
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

  const openMenu = (event: React.MouseEvent<HTMLElement>, blogId: number) => {
    setMenuAnchor(event.currentTarget);
    setSelectedBlogId(blogId);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setSelectedBlogId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* ✅ Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">Manage Blogs</h1>
          <div className="relative w-full sm:w-72" suppressHydrationWarning>
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <TextField
              id="blog-search"
              required
              fullWidth
              size="small"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                sx: { pl: 4 },
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
                <th className="py-3 px-3 text-center">Title</th>
                <th className="py-3 px-3 text-center">Slug</th>
                <th className="py-3 px-3 text-center">Category</th>
                <th className="py-3 px-3 text-center">Image</th>
                <th className="py-3 px-3 text-center">Created</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    Loading blogs...
                  </td>
                </tr>
              ) : paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((blog, idx) => (
                  <tr
                    key={blog.id}
                    className={`${
                      idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center">{startIndex + idx + 1}</td>
                    <td className="py-3 px-3 text-center">{blog.title}</td>
                    <td className="py-3 px-3 text-center">{blog.slug}</td>
                    <td className="py-3 px-3 text-center">{blog.category?.name}</td>
                    <td className="py-3 px-3 text-center">
                      {blog.image ? (
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-12 h-12 object-cover rounded mx-auto"
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <IconButton onClick={(e) => openMenu(e, blog.id)}>
                        <MoreVertical size={18} />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    No blogs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredBlogs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredBlogs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ⋮ Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            router.push("/admin/blogs/form/" + selectedBlogId);
          }}
        >
          <ListItemIcon>
            <Pencil size={18} color="var(--brand-secondary)" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedBlogId) handleDelete(selectedBlogId);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <Trash2 size={18} color="var(--brand-primary)" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

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
