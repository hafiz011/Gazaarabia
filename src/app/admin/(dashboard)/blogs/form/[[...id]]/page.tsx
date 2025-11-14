"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Upload } from "lucide-react";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import { blogService } from "@/lib/services/blogService";
import { blogCategoryService } from "@/lib/services/blogCategoryService";
import type { Category } from "@/lib/services/categoryService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function AddOrEditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const alowedRoles = ["admin", "content_manager"];

  const blogId = params?.id; // undefined when creating, defined when editing

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    image: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const [alert, setAlert] = useState<{ isOpen: boolean; type: "success" | "error" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [popup, setPopup] = useState<{ isOpen: boolean; type: "success" | "error" | "warning" | ""; message: string }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": { borderColor: "var(--brand-secondary)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "var(--brand-secondary)" },
  };

  // Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && !alowedRoles.includes(session?.user?.role)) {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  //  Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data: any = await blogCategoryService.getAll(session?.user?.token as string);
        setCategories(data?.data ?? null);
      } catch (err: any) {
        setAlert({
          isOpen: true,
          type: "error",
          message: err.message || "Failed to load categories.",
        });
      }
    };
    if (session?.user?.token) fetchCategories();
  }, [session?.user?.token]);

  //  Fetch blog if editing
  useEffect(() => {
    if (!blogId || !session?.user?.token) return;
    const fetchBlog = async () => {
      try {
        const res: any = await blogService.getById(session?.user?.token as string, Number(blogId));
        const data = res?.data ?? null;
        setForm({
          title: data.title,
          slug: data.slug,
          content: data.content,
          image: data.image,
          categoryId: String(data.categoryId),
        });
        setPreviewImage(data.image);
      } catch (err: any) {
        setAlert({
          isOpen: true,
          type: "error",
          message: err.message || "Failed to load blog details.",
        });
      }
    };
    fetchBlog();
  }, [blogId, session?.user?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  //  Upload image
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload?folder=blogs", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to upload image");

      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message || "Image upload failed." });
    }
  };

  // Submit (Add / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setPopup({ isOpen: true, type: "warning", message: "Please fill all required fields." });
      return;
    }
    if (!form.categoryId) {
      setPopup({ isOpen: true, type: "warning", message: "Please select a category." });
      return;
    }
    if (!form.image) {
      setPopup({ isOpen: true, type: "warning", message: "Please upload at least one image." });
      return;
    }

    try {
      setLoading(true);
      const token = session?.user?.token as string;

      if (blogId) {
        //  Update
        await blogService.update(token, Number(blogId), {
          title: form.title,
          slug: form.slug,
          content: form.content,
          image: form.image,
          categoryId: Number(form.categoryId),
        });
        setAlert({ isOpen: true, type: "success", message: "Blog updated successfully!" });
      } else {
        //  Create
        await blogService.create(token, {
          title: form.title,
          slug: form.slug,
          content: form.content,
          image: form.image,
          categoryId: Number(form.categoryId),
        });
        setAlert({ isOpen: true, type: "success", message: "Blog added successfully!" });
      }

      setTimeout(() => router.push("/admin/blogs"), 1200);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message || "Failed to save blog." });
    } finally {
      setLoading(false);
    }
  };

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
          <div className="mb-6 border-b pb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {blogId ? "Update Blog" : "Add Blog"}
            </h2>
          </div>

          <div className="space-y-4">
            <TextField
              label="Title"
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Slug"
              required
              name="slug"
              value={form.slug}
              onChange={handleChange}
              fullWidth
              sx={fieldStyle}
            />

            <TextField
              label="Content"
              required
              name="content"
              value={form.content}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              sx={fieldStyle}
            />

            <FormControl fullWidth required sx={fieldStyle}>
              <InputLabel id="category-select-label">Category</InputLabel>
              <Select
                labelId="category-select-label"
                value={form.categoryId}
                label="Category"
                onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
              >
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No categories found</MenuItem>
                )}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body1" mb={1}>
                Blog Image <span className="text-red-500">*</span>
              </Typography>
              <div
                onClick={handleUploadClick}
                style={{
                  border: "2px dashed var(--mid-gray)",
                  borderRadius: "8px",
                  height: "200px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fafafa",
                }}
              >
                {previewImage || form.image ? (
                  <img
                    src={previewImage || form.image}
                    alt="Preview"
                    style={{
                      maxHeight: "100%",
                      maxWidth: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <Upload className="text-gray-400" size={28} />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Box>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <Button
                variant="outlined"
                onClick={() => router.push("/admin/blogs")}
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
                sx={{
                  background: "var(--brand-primary)",
                  "&:hover": { background: "#c32230" },
                }}
                type="submit"
                disabled={loading}
              >
                {blogId ? "Update Blog" : "Add Blog"}
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
