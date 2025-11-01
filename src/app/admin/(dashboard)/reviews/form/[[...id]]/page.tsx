"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Rating,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import { adminReviewService } from "@/lib/services/adminReviewService";

export default function AdminAddOrEditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params?.id ? Number(params.id) : null; // detect edit mode

  const { data: session, status } = useSession();
  const token = session?.user?.token;

  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    userId: "",
    productId: "",
    rating: 0,
    comment: "",
  });

  const [alert, setAlert] = useState({
    isOpen: false,
    type: "" as "success" | "error" | "",
    message: "",
  });

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "" as "success" | "error" | "warning" | "",
    message: "",
  });

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-secondary)",
    },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-secondary)" },
  };

  // For dropdown width alignment
  const productSelectRef = useRef<HTMLDivElement>(null);
  const [productMenuWidth, setProductMenuWidth] = useState<number | null>(null);
  useEffect(() => {
    if (productSelectRef.current)
      setProductMenuWidth(productSelectRef.current.offsetWidth);
  }, [productSelectRef.current]);

  // 🛡️ Auth Guard
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace(ROUTES.ADMIN.LOGIN);
    else if (status === "authenticated" && session?.user?.role !== "admin")
      router.replace(ROUTES.HOME);
  }, [status, session, router]);

  // 📥 Fetch dropdowns + review data
  useEffect(() => {
    if (token) {
      fetchDropdownData();
      if (reviewId) fetchReviewData(reviewId);
    }
  }, [token, reviewId]);

  const fetchDropdownData = async () => {
    try {
      const res: any = await adminReviewService.getDropdownData(token!);
      setUsers(res.data.users || []);
      setProducts(res.data.products || []);
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to load users or products.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewData = async (id: number) => {
    try {
      const res: any = await adminReviewService.getById(token!, id);
      const data = res.data;
      if (data) {
        setForm({
          userId: data.userId,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment || "",
        });
      }
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to load review details.",
      });
    }
  };

  // ✅ Handle Submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userId || !form.productId || !form.rating) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "All required fields must be filled.",
      });
      return;
    }

    try {
      setLoading(true);
      let res: any;
      if (reviewId) {
        res = await adminReviewService.update(token!, reviewId, form);
      } else {
        res = await adminReviewService.create(token!, form);
      }

      if (res.success) {
        setAlert({
          isOpen: true,
          type: "success",
          message: reviewId
            ? "Review updated successfully!"
            : "Review added successfully!",
        });
        setTimeout(() => router.push("/admin/reviews"), 1200);
      }
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save review.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) return <Loader />;

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      {alert.isOpen && (alert.type === "success" || alert.type === "error") && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
        />
      )}

      <form onSubmit={handleSubmit}>
        <Box className="bg-white p-6 rounded-xl shadow border border-[var(--soft-gray)]">
          {/* Header */}
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {reviewId ? "Edit Product Review" : "Add Product Review (Admin)"}
            </h2>
          </div>

          <div className="space-y-5">
            {/* User */}
            <FormControl fullWidth required sx={fieldStyle}>
              <InputLabel id="user-select-label">User</InputLabel>
              <Select
                labelId="user-select-label"
                value={form.userId}
                label="User"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, userId: e.target.value }))
                }
              >
                {users.length > 0 ? (
                  users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No users found</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Product */}
            <FormControl
              fullWidth
              required
              sx={fieldStyle}
              ref={productSelectRef}
            >
              <InputLabel id="product-select-label">Product</InputLabel>
              <Select
                labelId="product-select-label"
                value={form.productId}
                label="Product"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, productId: e.target.value }))
                }
                renderValue={(selected) => {
                  const product = products.find((p) => p.id === selected);
                  if (!product) return "";
                  return (
                    <span
                      title={product.title}
                      style={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: "100%",
                      }}
                    >
                      {product.title}
                    </span>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      width: productMenuWidth
                        ? `${productMenuWidth}px`
                        : "auto",
                      maxHeight: 350,
                      overflowX: "hidden",
                      "& .MuiMenuItem-root": {
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    },
                  },
                }}
              >
                {products.length > 0 ? (
                  products.map((p) => (
                    <MenuItem key={p.id} value={p.id} title={p.title}>
                      {p.title}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No products found</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Rating */}
            <Box>
              <Typography variant="body1" mb={1}>
                Rating <span className="text-red-500">*</span>
              </Typography>
              <Rating
                name="rating"
                value={form.rating}
                onChange={(_, newValue) =>
                  setForm((prev) => ({ ...prev, rating: newValue || 0 }))
                }
              />
            </Box>

            {/* Comment */}
            <TextField
              label="Comment"
              name="comment"
              multiline
              rows={4}
              fullWidth
              value={form.comment}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="Write your review..."
              sx={fieldStyle}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button
                variant="outlined"
                onClick={() => router.push("/admin/reviews")}
                sx={{
                  color: "var(--text-primary)",
                  borderColor: "var(--mid-gray)",
                  "&:hover": { borderColor: "var(--text-primary)" },
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                type="submit"
                disabled={loading}
                sx={{
                  background: "var(--brand-primary)",
                  "&:hover": { background: "var(--brand-secondary)" },
                }}
              >
                {reviewId ? "Update Review" : "Add Review"}
              </Button>
            </div>
          </div>
        </Box>
      </form>

      {popup.isOpen && popup.type && (
        <PopupAlert
          type={popup.type as any}
          message={popup.message}
          confirmText="OK"
          onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
          show={popup.isOpen}
        />
      )}
    </Box>
  );
}
