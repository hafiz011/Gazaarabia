"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Trash2 } from "lucide-react";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { productService } from "@/lib/services/productService";
import { brandService } from "@/lib/services/brandService";
import { categoryService } from "@/lib/services/categoryService";
import { subcategoryService } from "@/lib/services/subcategoryService";
import { colorService } from "@/lib/services/colorService";
import { sizeService } from "@/lib/services/sizeService";
import { uploadService } from "@/lib/services/uploadService";
import { materialCareService } from "@/lib/services/materialCareService";

import { TextField, MenuItem, Box, Button } from "@mui/material";

function ProductFormContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const token :any= session?.user?.token; // get token
  const id = params?.id?.[0];
  const isEditMode = Boolean(id);

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    fitType: "",
    careAdvice: "",
    costPrice: "",
    sellingPrice: "",
    discountPrice: "",
    baseQty: "",
    barcode: "",
    brandId: "",
    categoryId: "",
    subcategoryId: "",
    active: true,
  });

  const [images, setImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [careAdvices, setCareAdvices] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const [alertMessage, setAlertMessage] = useState<AlertInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [popup, setPopup] = useState<PopUpInterface>({
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

  // 🔽 Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [
        brandsData,
        categoriesData,
        subcatData,
        colorsData,
        sizesData,
        careData,
      ]: any = await Promise.all([
        brandService.getAll(token),
        categoryService.getAll(token),
        subcategoryService.getAll(token),
        colorService.getAll(token),
        sizeService.getAll(token),
        materialCareService.getAll(token),
      ]);

      setBrands(brandsData.data ?? brandsData);
      setCategories(categoriesData.data ?? categoriesData);
      setSubcategories(subcatData.data ?? subcatData);
      setColors(colorsData.data ?? colorsData);
      setSizes(sizesData.data ?? sizesData);
      setCareAdvices(careData.data ?? careData);
    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Failed to load dropdown data.",
      });
    }
  };

  // 🔽 Fetch product if edit mode
  const fetchProduct = async () => {
    try {
      const res = await productService.getById(token!, Number(id));
      const data = res?.data ?? null;
      setForm({
        title: data.title || "",
        shortDescription: data.shortDescription || "",
        description: data.description || "",
        fitType: data.fitType || "",
        careAdvice: data.careAdvice || "",
        costPrice: data.costPrice || "",
        sellingPrice: data.sellingPrice || "",
        discountPrice: data.discountPrice || "",
        baseQty: data.baseQty || "",
        barcode: data.barcode || "",
        brandId: data.brandId?.toString() || "",
        categoryId: data.categoryId?.toString() || "",
        subcategoryId: data.subcategoryId?.toString() || "",
        active: data.active ?? true,
      });
      // setImages(data.images || []);
      setImages(data.productimage || []);
      setVariants(data.variants || []);
    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Failed to load product.",
      });
    }
  };

  useEffect(() => {
    if (token) {
      fetchDropdownData();
      if (isEditMode) fetchProduct();
    }
  }, [token, id]);

  // 📝 Handle form input
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🖼️ Upload Image
  const handleFileChange = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadService.uploadImage(file, "products");
      setImages((prev) => [...prev, { url, alt: "", colorId: "", primary: false }]);
    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Image upload failed.",
      });
    }
  };

  // ➕ Add variant
  const handleVariantAdd = () => {
    setVariants((prev) => [
      ...prev,
      { colorId: "", sizeId: "", sku: "", price: "", stock: "", isActive: true },
    ]);
  };

  // ✏️ Change variant
  const handleVariantChange = (idx: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  // 🗑️ Remove variant
  const handleVariantRemove = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateVariants = () => {
    for (const v of variants) {
      if (!v.colorId || !v.sizeId || !v.sku.trim() || !v.price || !v.stock)
        return false;
    }
    return true;
  };

  // 💾 Submit
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (images.length === 0) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "Please upload at least one image before saving the product.",
      });
      return;
    }

    if (variants.length > 0 && !validateVariants()) {
      setPopup({
        isOpen: true,
        type: "warning",
        message:
          "Please fill all required fields in variants (Color, Size, SKU, Price, Stock).",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...form, images, variants };

      if (isEditMode) {
        await productService.update(token!, Number(id), payload);
        setAlertMessage({
          isOpen: true,
          type: "success",
          message: "Product updated successfully!",
        });
      } else {
        await productService.create(token!, payload);
        setAlertMessage({
          isOpen: true,
          type: "success",
          message: "Product added successfully!",
        });
      }

      setTimeout(() => router.push("/admin/products"), 1200);
    } catch (err: any) {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save product.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const RequiredLabel = ({ text }: { text: string }) => (
    <span>
      {text} <span className="text-red-600">*</span>
    </span>
  );

  return (
    <Box className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isEditMode ? "Update Product" : "Add Product"}
      </h1>

      {alertMessage.isOpen && alertMessage.type && (
        <AlertMessage
          type={alertMessage.type}
          message={alertMessage.message}
          onClose={() => setAlertMessage((p) => ({ ...p, isOpen: false }))}
        />
      )}

       {/* ✅ Full UI inside form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* 🧾 Basic Info */}
        <Box className="bg-white p-6 rounded-xl shadow space-y-4">
          <TextField label={<RequiredLabel text="Brand" />} select name="brandId"
            value={form.brandId} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle}>
            {brands.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
          </TextField>

          <TextField label={<RequiredLabel text="Category" />} select name="categoryId"
            value={form.categoryId} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle}>
            {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </TextField>

          <TextField label={<RequiredLabel text="Subcategory" />} select name="subcategoryId"
            value={form.subcategoryId} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle}>
            {subcategories.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField>

          <TextField label={<RequiredLabel text="Title" />} name="title" value={form.title}
            onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />

          <TextField label={<RequiredLabel text="Short Description" />} name="shortDescription"
            value={form.shortDescription} onChange={handleInputChange} inputProps={{ required: true }}
            fullWidth multiline rows={2} sx={fieldStyle} />

          <TextField label={<RequiredLabel text="Description" />} name="description"
            value={form.description} onChange={handleInputChange} inputProps={{ required: true }}
            fullWidth multiline rows={3} sx={fieldStyle} />

          <TextField select label={<RequiredLabel text="Care Advice" />} name="careAdvice"
            value={form.careAdvice} onChange={handleInputChange} inputProps={{ required: true }}
            fullWidth sx={fieldStyle}>
            {careAdvices.map((care) => (
              <MenuItem key={care.id} value={care.title}>
                {care.title} ({care.material})
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* 💰 Pricing */}
        <Box className="bg-white p-6 rounded-xl shadow space-y-4">
          <TextField label={<RequiredLabel text="Cost Price" />} name="costPrice" type="number"
            value={form.costPrice} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          <TextField label={<RequiredLabel text="Selling Price" />} name="sellingPrice" type="number"
            value={form.sellingPrice} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          <TextField label={<RequiredLabel text="Discount Price" />} name="discountPrice" type="number"
            value={form.discountPrice} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          <TextField label={<RequiredLabel text="Base Qty" />} name="baseQty" type="number"
            value={form.baseQty} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          <TextField label={<RequiredLabel text="Barcode" />} name="barcode"
            value={form.barcode} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />

          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" name="active" checked={form.active} onChange={handleInputChange}
              className="w-4 h-4 accent-[var(--brand-secondary)] cursor-pointer" />
            <label htmlFor="active" className="text-gray-700 font-medium cursor-pointer">Active</label>
          </div>
        </Box>

        {/* 🖼️ Images */}
        <Box className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-2">
            Images <span className="text-red-600">*</span>
          </h2>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative group">
                <img src={img.url} alt="" className="w-24 h-24 object-cover rounded border" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, i) => i !== idx))}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-24 h-24 border-2 border-dashed flex items-center justify-center cursor-pointer rounded text-gray-400 hover:text-black transition"
            >
              <Upload size={24} />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>
        </Box>

        {/* 🧩 Variants */}
        <Box className="lg:col-span-2 bg-white p-6 rounded-xl shadow space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Variants (Color × Size)</h2>
            <Button variant="contained" sx={{ background: "var(--brand-secondary)" }} onClick={handleVariantAdd}>
              <Plus size={16} style={{ marginRight: 4 }} /> Add Variant
            </Button>
          </div>

          {variants.map((v, idx) => (
            <div key={idx} className="grid grid-cols-8 gap-2 items-center">
              <TextField select label={<RequiredLabel text="Color" />} value={v.colorId}
                onChange={(e) => handleVariantChange(idx, "colorId", e.target.value)}
                inputProps={{ required: true }} fullWidth sx={fieldStyle}>
                {colors.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </TextField>

              <TextField select label={<RequiredLabel text="Size" />} value={v.sizeId}
                onChange={(e) => handleVariantChange(idx, "sizeId", e.target.value)}
                inputProps={{ required: true }} fullWidth sx={fieldStyle}>
                {sizes.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>

              <TextField label={<RequiredLabel text="SKU" />} value={v.sku}
                onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                inputProps={{ required: true }} sx={fieldStyle} />

              <TextField label={<RequiredLabel text="Price" />} type="number" value={v.price}
                onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                inputProps={{ required: true }} sx={fieldStyle} />

              <TextField label={<RequiredLabel text="Stock" />} type="number" value={v.stock}
                onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                inputProps={{ required: true }} sx={fieldStyle} />

              <label className="flex justify-center items-center gap-1 col-span-1">
                <input type="checkbox" checked={v.isActive}
                  onChange={(e) => handleVariantChange(idx, "isActive", e.target.checked)} />
                Active
              </label>

              <button
                type="button"
                onClick={() => handleVariantRemove(idx)}
                className="text-red-500 hover:text-red-700 transition flex justify-center col-span-1"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </Box>

        {/* 🆗 Actions */}
        <Box className="lg:col-span-2 flex justify-end gap-3 mt-6">
          <Button variant="outlined" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button variant="contained" sx={{ background: "var(--brand-secondary)" }} type="submit" disabled={submitting}>
            {submitting ? "Saving..." : isEditMode ? "Update Product" : "Add Product"}
          </Button>
        </Box>
      </form>

      <PopupAlert
        type={popup.type as any}
        message={popup.message}
        confirmText={"OK"}
        onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
        show={popup.isOpen}
      />
    </Box>
  );
}

export default dynamic(() => Promise.resolve(ProductFormContent), { ssr: false });
