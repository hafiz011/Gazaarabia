"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TextField, MenuItem, Box, Button } from "@mui/material";
import { Upload } from "lucide-react";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import { PopUpInterface, AlertInterface } from "@/lib/types";

export default function AddBlogPage() {
  const router = useRouter();

  // 📝 Form state
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    categoryId: "" as number | string,
    image: "",
  });

  // 📸 Preview state
  const [preview, setPreview] = useState("");

  // 📤 File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 📂 Category data
  const [categories, setCategories] = useState<any[]>([]);

  // ⚡ Loading states
  const [submitting, setSubmitting] = useState(false);

  // ⚠️ Alert states
  const [popupAlert, setPopupAlert] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [alertMessage, setAlertMessage] = useState<AlertInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-secondary)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--brand-secondary)",
    },
  };

  // 📥 Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/blog-categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Failed to load categories.",
      });
    }
  };

  // 🖼️ Upload
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload?folder=blogs", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();

      setForm((prev) => ({ ...prev, image: data.url }));
    } catch (err: any) {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: err.message || "Image upload failed.",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "categoryId" ? Number(value) : value,
    }));
  };

  // 📝 Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.categoryId) {
      setPopupAlert({
        isOpen: true,
        type: "warning",
        message: "Please fill all required fields.",
        onConfirm: () => setPopupAlert((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setAlertMessage({
          isOpen: true,
          type: "error",
          message: data.error || "Failed to create blog.",
        });
        setSubmitting(false);
        return;
      }

      setAlertMessage({
        isOpen: true,
        type: "success",
        message: "Blog added successfully!",
      });

      setTimeout(() => router.push("/admin/blogs"), 1000);
    } catch (err: any) {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save blog.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-6">Add New Blog</h1>

        {/* ✅ Alert Message */}
        {alertMessage.isOpen && alertMessage.type && (
          <AlertMessage
            type={alertMessage.type}
            message={alertMessage.message}
            onClose={() =>
              setAlertMessage((prev) => ({ ...prev, isOpen: false }))
            }
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            required
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          />

          <TextField
            label="Slug (optional)"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
            helperText="Leave empty to auto-generate from title"
          />

          <TextField
            required
            label="Category"
            name="categoryId"
            select
            value={form.categoryId}
            onChange={handleChange}
            fullWidth
            sx={fieldStyle}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>
                {cat.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            required
            label="Content"
            name="content"
            value={form.content}
            onChange={handleChange}
            fullWidth
            multiline
            rows={6}
            sx={fieldStyle}
          />

          {/* 🖼️ Image Upload (same design as BrandFormPage) */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">Image</label>
            <div
              onClick={handleUploadClick}
              className="border-2 border-dashed rounded-md py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand-primary)]"
            >
              {preview || form.image ? (
                <img
                  src={preview || form.image}
                  alt="Preview"
                  className="h-32 object-contain"
                />
              ) : (
                <Upload className="text-gray-400" size={28} />
              )}
              <p className="text-sm text-gray-500 mt-2">
                Click to upload or drop an image
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
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
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Add Blog"}
            </Button>
          </div>
        </form>

        {/* 🆕 Popup Alert */}
        <PopupAlert
          type={popupAlert.type as any}
          message={popupAlert.message}
          confirmText={popupAlert.type === "confirm" ? "Yes" : "OK"}
          cancelText={popupAlert.type === "confirm" ? "Cancel" : undefined}
          onConfirm={popupAlert.onConfirm}
          onCancel={popupAlert.onCancel}
          show={popupAlert.isOpen}
        />
      </div>
    </Box>
  );
}
