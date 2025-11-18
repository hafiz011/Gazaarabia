"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { menuService } from "@/lib/services/menuService";
import { uploadService } from "@/lib/services/uploadService";
import {
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Image as ImageIcon, Delete as DeleteIcon, UploadFile } from "@mui/icons-material";
import AlertMessage from "@/components/AlertMessage";

export default function MenusFormPage() {
  const { data: session } = useSession();
  const token = session?.user?.token;
  const params = useParams();
  const router = useRouter();
  const menuId = params?.id ? Number(params.id) : null;

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "",
    images: [] as string[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<any>({ isOpen: false });
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (token && menuId) fetchMenu();
    else setLoading(false);
  }, [token, menuId]);

  const fetchMenu = async () => {
    try {
      const res: any = await menuService.getById(token!, menuId!);
      if (res.success) setForm(res.data);
    } catch (err) {
      console.error("Error fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = async (e: any) => {
    const files: any = Array.from(e.target.files || []);
    if (files.length + form.images.length > 2) {
      setAlert({ isOpen: true, type: "warning", message: "Max 2 images allowed" });
      return;
    }
    const urls = await uploadService.uploadMultiple(files, "menus");
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const handleImageRemove = (index: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (menuId) {
        await menuService.update(token!, menuId, form);
        setAlert({ isOpen: true, type: "success", message: "Menu updated successfully!" });
      } else {
        await menuService.create(token!, form);
        setAlert({ isOpen: true, type: "success", message: "Menu created successfully!" });
        setForm({ name: "", slug: "", type: "", images: [] });
      }
      setTimeout(() => router.push("/admin/menus"), 1200);
    } catch (err: any) {
      setAlert({ isOpen: true, type: "error", message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box className="p-8 text-center text-gray-500">Loading menu data...</Box>
    );

  return (
    <Box className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow border border-gray-100">
      <Typography variant="h5" className="font-semibold mb-4">
        {menuId ? "Edit Menu" : "Add Menu"}
      </Typography>

      {alert.isOpen && (
        <div className="mt-6">
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert({ isOpen: false })}
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 mt-5">
        <TextField
          name="name"
          label="Name"
          fullWidth
          required
          value={form.name}
          onChange={handleChange}
        />
        <TextField
          name="slug"
          label="Slug"
          fullWidth
          required
          value={form.slug}
          onChange={handleChange}
        />
        <TextField
          name="type"
          label="Type"
          select
          fullWidth
          required
          value={form.type}
          onChange={handleChange}
        >
          <MenuItem value="product">Product</MenuItem>
          <MenuItem value="blog">Blog</MenuItem>
          <MenuItem value="gallery">Gallery</MenuItem>
        </TextField>

        {/*  Image Upload Section */}
        <Box className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" className="font-semibold">
              Upload Images (Max 2)
            </Typography>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={form.images.length >= 2}
              className={`${form.images.length >= 2 ? "opacity-50 cursor-not-allowed" : ""} border border-[var(--brand-primary)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white text-sm font-medium rounded-md px-4 py-1.5 transition`}
            >
              <UploadFile fontSize="small" className="mr-1 inline" />
              Upload
            </button>
          </div>

          <input
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            ref={fileRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {form.images.length === 0 ? (
            <Box className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <ImageIcon sx={{ fontSize: 40, color: "gray" }} />
              <Typography variant="body2" color="textSecondary" className="mt-2">
                No images uploaded yet.
              </Typography>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mt-3 bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white text-sm px-4 py-2 rounded-md shadow transition"
              >
                Upload Image
              </button>
            </Box>
          ) : (
            <div className="flex flex-wrap gap-4">
              {form.images.map((img, i) => (
                <Box
                  key={i}
                  className="relative group w-32 h-32 rounded-lg overflow-hidden shadow-sm border bg-white"
                >
                  <img
                    src={img}
                    alt={`menu-img-${i}`}
                    className="w-full h-full object-cover"
                  />
                  <Tooltip title="Remove">
                    <IconButton
                      size="small"
                      onClick={() => handleImageRemove(i)}
                      className="!absolute top-1 right-1 bg-white/80 hover:bg-red-100"
                    >
                      <DeleteIcon fontSize="small" color="error" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </div>
          )}
        </Box>

        {/*  Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className={`${submitting ? "opacity-70 cursor-not-allowed" : ""} bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white font-medium px-6 py-2 rounded-md shadow transition`}
          >
            {submitting
              ? "Saving..."
              : menuId
                ? "Update Menu"
                : "Save Menu"}
          </button>
        </div>
      </form>
    </Box>
  );
}
