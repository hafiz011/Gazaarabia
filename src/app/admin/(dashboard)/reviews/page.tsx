"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import Pagination from "@/components/admin/Pagination";
import PopupAlert from "@/components/PopupAlert";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import { adminReviewService } from "@/lib/services/adminReviewService";
import { PopUpInterface } from "@/lib/types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Rating,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

export default function AdminReviewListPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuReview, setMenuReview] = useState<any | null>(null);

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

  //  Fetch all reviews
  useEffect(() => {
    if (token) fetchReviews();
  }, [token]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res: any = await adminReviewService.getAll(token!);
      setReviews(res?.data || []);
    } catch (error) {
      setPopUpAlertData({
        isOpen: true,
        type: "error",
        message: "Failed to fetch reviews.",
        onConfirm: () =>
          setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
    } finally {
      setLoading(false);
    }
  };

  //  Filter + Pagination
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) =>
      `${rev.user?.name} ${rev.product?.title} ${rev.comment}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [reviews, searchTerm]);

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedReviews = filteredReviews.slice(
    startIndex,
    startIndex + pageSize
  );

  // ⋮ Menu Actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, review: any) => {
    setMenuAnchor(event.currentTarget);
    setMenuReview(review);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuReview(null);
  };

  // Delete
  const handleDelete = (id: number) => {
    setPopUpAlertData({
      isOpen: true,
      type: "confirm",
      message: "Are you sure you want to delete this review?",
      onConfirm: async () => {
        try {
          setDeletingId(id);
          await adminReviewService.remove(token!, id);
          setPopUpAlertData({
            isOpen: true,
            type: "success",
            message: "Review deleted successfully!",
            onConfirm: () =>
              setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
          fetchReviews();
        } catch (err: any) {
          setPopUpAlertData({
            isOpen: true,
            type: "error",
            message: err.message || "Failed to delete review.",
            onConfirm: () =>
              setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
          });
        } finally {
          setDeletingId(null);
        }
      },
      onCancel: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
    });
  };

  // View details
  const handleView = (review: any) => {
    setSelectedReview(review);
    setIsModalOpen(true);
  };

  if (status === "loading" || loading) return <Loader />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/*  Header with search */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4">
          <h1 className="text-xl font-semibold text-gray-800">
            Manage Product Reviews
          </h1>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, product, or comment..."
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
                <th className="py-3 px-3 text-center">User</th>
                <th className="py-3 px-3 text-center">Product</th>
                <th className="py-3 px-3 text-center">Rating</th>
                <th className="py-3 px-3 text-center">Comment</th>
                <th className="py-3 px-3 text-center">Date</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReviews.length > 0 ? (
                paginatedReviews.map((rev, idx) => (
                  <tr
                    key={rev.id}
                    className={`${idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-gray-100 transition`}
                  >
                    <td className="py-3 px-3 text-center text-gray-600">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium">
                      {rev.user?.name || "-"}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-800 font-medium truncate max-w-[200px]">
                      {rev.product?.title || "-"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Rating value={rev.rating} readOnly size="small" />
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600 truncate max-w-[250px]">
                      {rev.comment?.length > 40
                        ? rev.comment.slice(0, 40) + "..."
                        : rev.comment}
                    </td>
                    <td className="py-3 px-3 text-center text-gray-600">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, rev)}
                        size="small"
                      >
                        <MoreVertical size={18} />
                      </IconButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/*  Pagination */}
        {!loading && filteredReviews.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredReviews.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>

      {/* ⋮ Action Menu */}
      {/* ⋮ Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        {/*  View Option */}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            handleView(menuReview);
          }}
        >
          <ListItemIcon>
            <Eye size={18} className="text-blue-500" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ className: "text-gray-800" }}>
            View
          </ListItemText>
        </MenuItem>

        {/*  Edit Option */}
        <MenuItem
          onClick={() => {
            handleMenuClose();
            router.push(`/admin/reviews/form/${menuReview.id}`);
          }}
        >
          <ListItemIcon>
            <Pencil size={18} className="text-[var(--brand-secondary)]" />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ className: "text-[var(--brand-secondary)] font-medium" }}>
            Edit
          </ListItemText>
        </MenuItem>

        {/*  Delete Option */}
        <MenuItem
          disabled={deletingId === menuReview?.id}
          onClick={() => {
            handleMenuClose();
            handleDelete(menuReview.id);
          }}
        >
          <ListItemIcon>
            <Trash2
              size={18}
              className={`${deletingId === menuReview?.id
                ? "text-gray-400"
                : "text-[var(--brand-primary)]"
                }`}
            />
          </ListItemIcon>
          <ListItemText
            primaryTypographyProps={{
              className: `${deletingId === menuReview?.id
                ? "text-gray-400"
                : "text-[var(--brand-primary)] font-medium"
                }`,
            }}
          >
            {deletingId === menuReview?.id ? "Deleting..." : "Delete"}
          </ListItemText>
        </MenuItem>
      </Menu>


      {/* View Review Modal */}
      {isModalOpen && selectedReview && (
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Review Details</DialogTitle>
          <DialogContent className="space-y-4 py-4">
            <div>
              <p className="text-sm text-gray-500">User</p>
              <p className="font-medium text-gray-800">
                {selectedReview.user?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Product</p>
              <p className="font-medium text-gray-800">
                {selectedReview.product?.title}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <Rating value={selectedReview.rating} readOnly />
            </div>
            <div>
              <p className="text-sm text-gray-500">Comment</p>
              <p className="font-medium text-gray-800">
                {selectedReview.comment || "No comment"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium text-gray-800">
                {new Date(selectedReview.createdAt).toLocaleString()}
              </p>
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Popup Alert */}
      <PopupAlert
        type={popUpAlertData.type as any}
        message={popUpAlertData.message}
        confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
        cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
        onConfirm={popUpAlertData.onConfirm}
        onCancel={
          popUpAlertData.type === "confirm" ? popUpAlertData.onCancel : undefined
        }
        show={popUpAlertData.isOpen}
      />
    </div>
  );
}
