"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Plus, Check, ImageIcon, Info, Layers, DollarSign, Shirt, Eye, AlertCircle, ShoppingBag } from "lucide-react";
import PopupAlert from "@/components/PopupAlert";
import AlertMessage from "@/components/AlertMessage";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { productService } from "@/lib/services/seller/productService";
import { brandService } from "@/lib/services/brandService";
import { categoryService } from "@/lib/services/categoryService";
import { subcategoryService } from "@/lib/services/subcategoryService";
import { colorService } from "@/lib/services/colorService";
import { sizeService } from "@/lib/services/sizeService";
import { uploadService } from "@/lib/services/uploadService";
import { materialCareService } from "@/lib/services/materialCareService";

import { TextField, MenuItem, Box, Button } from "@mui/material";
import { ROUTES } from "@/constants/routes";
import RichTextEditor from "@/components/RichTextEditor";
import { MediaUploader } from "@/components/seller/MediaUploader";
import { VariantCard } from "@/components/seller/VariantCard";
import { ProductPreviewCard } from "@/components/seller/ProductPreviewCard";

function ProductFormContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const token: any = session?.user?.token;
  const id = params?.id?.[0];
  const isEditMode = Boolean(id);

  const allowedRoles = ["seller"];
  const variantsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    if (status === "authenticated" && !allowedRoles.includes(session?.user?.role)) {
      router.replace(ROUTES.HOME);
    }
  }, [session, router]);

  const [form, setForm] = useState({
    slug: "",
    title: "",
    shortDescription: "",
    description: "",
    fitType: "",
    materialCareId: "",
    soldCount: "",
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

  const [wearWith, setWearWith] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
    "& .MuiOutlinedInput-root": {
      borderRadius: "0.5rem",
      backgroundColor: "#f9fafb",
      "&:hover fieldset": {
        borderColor: "#cbd5e1",
      },
    },
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-secondary, #2563eb)",
      borderWidth: "2px",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--brand-secondary, #2563eb)",
    },
  };

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

  const fetchProduct = async () => {
    try {
      const res = await productService.getById(token!, Number(id));
      const data = res?.data ?? null;
      setForm({
        slug: data.slug || "",
        title: data.title || "",
        shortDescription: data.shortDescription || "",
        description: data.description || "",
        fitType: data.fitType || "",
        soldCount: data.soldCount || "",
        materialCareId: data.materialCareId || "",
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
      setImages(data.productimage || []);
      setVariants(
        (data.productvariant || []).map((v: any) => ({
          ...v,
          images: v.variantImages || [],
        }))
      );
      setWearWith(data.wearWith || []);
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

  const handleInputChange = async (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "categoryId") {
      setForm((prev) => ({ ...prev, subcategoryId: "" }));
      if (value) {
        try {
          const res: any = await subcategoryService.getByCategory(token, Number(value));
          setSubcategories(res.data ?? []);
        } catch {
          setSubcategories([]);
        }
      } else {
        setSubcategories([]);
      }
    }
  };

  const handleVariantAdd = () => {
    const newVariant = {
      colorId: "",
      sizeId: "",
      sku: "",
      price: form.sellingPrice || "",
      stock: "",
      isActive: true,
      images: [],
      videoUrl: "",
      videoThumbnail: "",
    };
    setVariants((prev) => [...prev, newVariant]);
    setTimeout(() => {
      variantsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleVariantChange = (idx: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  const handleVariantRemove = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleVariantCopy = (idx: number) => {
    setVariants((prev) => {
      const variantToCopy = prev[idx];
      const newVariant = {
        ...variantToCopy,
        id: undefined,
        sku: "",
      };
      const newVariants = [...prev];
      newVariants.splice(idx + 1, 0, newVariant);
      return newVariants;
    });
    setTimeout(() => {
      variantsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const validateVariants = () => {
    for (const v of variants) {
      if (!v.colorId || !v.sizeId || !v.sku.trim() || !v.price || !v.stock)
        return false;
    }
    return true;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (images.length === 0) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "Please upload at least one main product image.",
      });
      return;
    }

    if (!form.title || !form.description || !form.slug || !form.brandId || !form.categoryId) {
       setPopup({
        isOpen: true,
        type: "warning",
        message: "Please fill in all basic product information.",
      });
      return;
    }

    if (variants.length === 0) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "Please add at least one product variant.",
      });
      return;
    }

    if (variants.length > 0 && !validateVariants()) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "Please fill all required fields for each variant.",
      });
      return;
    }

    if (!form.costPrice || !form.sellingPrice || !form.baseQty || !form.barcode) {
      setPopup({
        isOpen: true,
        type: "warning",
        message: "Please fill in all required pricing and inventory details.",
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        images,
        variants,
        wearWith: wearWith.map((w) => w.id),
      };

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
          message: "Product published successfully!",
        });
      }

      setTimeout(() => router.push("/seller/products"), 1200);
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

  const handleSearchProducts = async () => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      const res = await productService.getAll(token, searchQuery);
      const products = res.data ?? [];
      setSearchResults(products.filter((p: any) => p.id !== Number(id)));
    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Failed to search products.",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddWearWith = (product: any) => {
    if (!wearWith.find((p) => p.id === product.id)) {
      setWearWith((prev) => [...prev, product]);
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleRemoveWearWith = (productId: number | string) => {
    setWearWith((prev) => prev.filter((p) => p.id !== productId));
  };

  const RequiredLabel = ({ text }: { text: string }) => (
    <span className="font-medium text-gray-700">{text} <span className="text-red-500">*</span></span>
  );

  return (
    <Box className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={24} />
            <h1 className="text-xl font-bold text-gray-900">
              {isEditMode ? "Update Product" : "Publish New Product"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outlined"
              onClick={() => router.push("/seller/products")}
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, borderColor: '#E2E8F0', color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ background: "var(--brand-secondary, #2563eb)", textTransform: 'none', borderRadius: '8px', fontWeight: 600, boxShadow: 'none' }}
            >
              {submitting ? "Saving..." : isEditMode ? "Update Product" : "Publish Product"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {alertMessage.isOpen && alertMessage.type && (
          <AlertMessage
            type={alertMessage.type}
            message={alertMessage.message}
            onClose={() => setAlertMessage((p) => ({ ...p, isOpen: false }))}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* MEDIA */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-6 flex items-center gap-2">
                  <ImageIcon className="text-blue-600" size={24} />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Product Media</h2>
                    <p className="text-gray-500 mt-1">Upload high-quality images and video to showcase your product.</p>
                  </div>
                </div>

                <MediaUploader
                  images={images}
                  onImagesChange={setImages}
                  onError={(msg) =>
                    setAlertMessage({ isOpen: true, type: "error", message: msg })
                  }
                  maxImages={10}
                />

                <div className="mt-6 bg-blue-50/50 rounded-xl p-4 flex gap-3 items-start border border-blue-100">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Media Guidelines</p>
                    <ul className="list-disc pl-4 space-y-1 text-blue-800/80">
                      <li>First image will be the product cover.</li>
                      <li>Use clear, well-lit photos with a clean background.</li>
                      <li>Recommended resolution: 1080x1080px (1:1 ratio).</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* BASIC INFO */}
              <div className="space-y-6">
                {/* Categorization Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Layers className="text-blue-600" size={24} />
                    Categorization
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TextField
                      label={<RequiredLabel text="Brand" />}
                      select
                      name="brandId"
                      value={form.brandId}
                      onChange={handleInputChange}
                      fullWidth
                      sx={fieldStyle}
                    >
                      {brands.map((b) => (
                        <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label={<RequiredLabel text="Care Advice" />}
                      name="materialCareId"
                      value={form.materialCareId}
                      onChange={handleInputChange}
                      fullWidth
                      sx={fieldStyle}
                    >
                      {careAdvices.map((care) => (
                        <MenuItem key={care.id} value={care.id}>
                          {care.title} ({care.material})
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label={<RequiredLabel text="Category" />}
                      select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={handleInputChange}
                      fullWidth
                      sx={fieldStyle}
                    >
                      {categories.map((c) => (
                        <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      label={<RequiredLabel text="Subcategory" />}
                      select
                      name="subcategoryId"
                      value={form.subcategoryId}
                      onChange={handleInputChange}
                      disabled={!form.categoryId}
                      fullWidth
                      sx={fieldStyle}
                    >
                      {subcategories.map((s) => (
                        <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                      ))}
                    </TextField>
                  </div>
                </div>

                {/* Product Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Info className="text-blue-600" size={24} />
                    Product Details
                  </h2>

                  <div className="space-y-6">
                    <TextField
                      label={<RequiredLabel text="Product Title" />}
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      fullWidth
                      sx={fieldStyle}
                      placeholder="e.g., Premium Cotton T-Shirt"
                    />

                    <TextField
                      label={<RequiredLabel text="URL Slug" />}
                      name="slug"
                      value={form.slug}
                      onChange={handleInputChange}
                      fullWidth
                      sx={fieldStyle}
                      placeholder="e.g., premium-cotton-tshirt"
                      helperText="Used in product link. Must be unique."
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Short Description <span className="text-red-500">*</span></label>
                      <RichTextEditor
                        value={form.shortDescription}
                        onChange={(value) => setForm((prev) => ({ ...prev, shortDescription: value }))}
                        minHeight={120}
                        placeholder="Brief summary for listings..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Description <span className="text-red-500">*</span></label>
                      <RichTextEditor
                        value={form.description}
                        onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                        minHeight={250}
                        placeholder="Detailed features, materials..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* VARIANTS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Layers className="text-blue-600" size={24} />
                      Product Variants
                    </h2>
                    <p className="text-gray-500 mt-1">Add different colors, sizes, and set stock levels.</p>
                  </div>
                  <Button
                    type="button"
                    variant="contained"
                    onClick={handleVariantAdd}
                    sx={{ 
                      background: "var(--brand-secondary, #2563eb)", 
                      whiteSpace: "nowrap",
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: 'none',
                      px: 3,
                      py: 1.5
                    }}
                    startIcon={<Plus size={20} />}
                  >
                    Add New Variant
                  </Button>
                </div>

                {variants.length === 0 ? (
                  <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                      <Layers className="text-gray-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No variants created</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">Create variants to offer different options like colors and sizes for your product.</p>
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={handleVariantAdd}
                      sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                    >
                      Create First Variant
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {variants.map((variant, idx) => (
                      <div key={idx} className="relative group transition-all duration-300">
                        <VariantCard
                          variant={variant}
                          index={idx}
                          colors={colors}
                          sizes={sizes}
                          onVariantChange={(field, value) => handleVariantChange(idx, field, value)}
                          onVariantRemove={() => handleVariantRemove(idx)}
                          onVariantCopy={() => handleVariantCopy(idx)}
                          onError={(msg) => setAlertMessage({ isOpen: true, type: "error", message: msg })}
                          autoFillPrice={form.sellingPrice}
                        />
                      </div>
                    ))}
                    <div ref={variantsEndRef} className="h-4" />
                  </div>
                )}
              </div>

              {/* PRICING */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="text-blue-600" size={24} />
                    Pricing & Inventory
                  </h2>
                  <p className="text-gray-500 mt-1">Set your base product pricing and tracking information.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TextField
                    label={<RequiredLabel text="Selling Price" />}
                    name="sellingPrice"
                    type="number"
                    value={form.sellingPrice}
                    onChange={handleInputChange}
                    inputProps={{ step: "0.01", min: "0" }}
                    fullWidth
                    sx={fieldStyle}
                    InputProps={{
                      startAdornment: <span className="text-gray-500 mr-2">$</span>,
                    }}
                  />
                  <TextField
                    label={<RequiredLabel text="Cost Price" />}
                    name="costPrice"
                    type="number"
                    value={form.costPrice}
                    onChange={handleInputChange}
                    inputProps={{ step: "0.01", min: "0" }}
                    fullWidth
                    sx={fieldStyle}
                    InputProps={{
                      startAdornment: <span className="text-gray-500 mr-2">$</span>,
                    }}
                  />
                </div>

                <div className="mt-4 mb-8 bg-green-50 rounded-xl p-4 flex gap-3 items-center border border-green-100">
                  <DollarSign className="text-green-600 shrink-0" size={24} />
                  <div>
                    <p className="text-sm font-medium text-green-900">Estimated Profit Margin</p>
                    <p className="text-2xl font-bold text-green-700">
                      ${Math.max(0, Number(form.sellingPrice || 0) - Number(form.costPrice || 0)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                  <TextField
                    label={<RequiredLabel text="Base Quantity" />}
                    name="baseQty"
                    type="number"
                    value={form.baseQty}
                    onChange={handleInputChange}
                    inputProps={{ min: "0" }}
                    fullWidth
                    sx={fieldStyle}
                    helperText="Initial stock level for base product"
                  />
                  <TextField
                    label={<RequiredLabel text="Barcode (EAN/UPC)" />}
                    name="barcode"
                    value={form.barcode}
                    onChange={handleInputChange}
                    fullWidth
                    sx={fieldStyle}
                  />
                </div>
              </div>

              {/* WEAR WITH */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Shirt className="text-blue-600" size={24} />
                    Complete the Look
                  </h2>
                  <p className="text-gray-500 mt-1">Cross-sell related items customers might want to buy together.</p>
                </div>

                {/* Search Section */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Products to Link</h3>
                  <div className="flex gap-3">
                    <TextField
                      placeholder="Search by title..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchProducts()}
                      fullWidth
                      sx={{ ...fieldStyle, backgroundColor: "white" }}
                    />
                    <Button
                      variant="contained"
                      sx={{ 
                        background: "var(--brand-secondary, #2563eb)", 
                        whiteSpace: "nowrap",
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 'none',
                        px: 4
                      }}
                      onClick={handleSearchProducts}
                      disabled={isSearching}
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </Button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm max-h-72 overflow-y-auto">
                      <div className="divide-y divide-gray-100">
                        {searchResults.map((prod) => (
                          <div key={prod.id} className="flex items-center justify-between p-3 hover:bg-blue-50/50 transition">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <img
                                src={prod?.productimage?.[0]?.url || "/images/placeholder.jpg"}
                                alt={prod.title}
                                className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                              />
                              <div>
                                <span className="text-sm font-semibold text-gray-900 block truncate">{prod.title}</span>
                                <span className="text-xs text-gray-500">${prod.sellingPrice}</span>
                              </div>
                            </div>
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: "none", borderRadius: "6px", fontWeight: 600 }}
                              onClick={() => handleAddWearWith(prod)}
                            >
                              Link Item
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Items Carousel */}
                {wearWith.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Linked Items ({wearWith.length})</h3>
                    </div>
                    
                    {/* TikTok style horizontal scroll */}
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                      {wearWith.map((prod) => (
                        <div
                          key={prod.id}
                          className="flex-shrink-0 w-36 group relative snap-start"
                        >
                          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                            <div className="aspect-[4/5] relative">
                              <img
                                src={prod?.productimage?.[0]?.url || "/images/placeholder.jpg"}
                                alt={prod.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveWearWith(prod.id)}
                                  className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-red-600 transform scale-90 group-hover:scale-100 transition-transform"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                            <div className="p-3">
                              <p className="text-xs font-medium text-gray-900 line-clamp-2 leading-snug">
                                {prod.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No related products linked yet.</p>
                  </div>
                )}
              </div>

              {/* Form Navigation (Bottom) */}
              <div className="mt-8 flex items-center justify-end border-t border-gray-200 pt-6">
                <div className="flex gap-4">
                  <Button
                    variant="outlined"
                    onClick={() => router.push("/seller/products")}
                    sx={{ 
                      borderRadius: '8px', 
                      textTransform: 'none', 
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      borderColor: '#cbd5e1',
                      color: '#475569'
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    sx={{ 
                      background: "var(--brand-secondary, #2563eb)", 
                      borderRadius: '8px', 
                      textTransform: 'none', 
                      fontWeight: 600,
                      boxShadow: 'none',
                      px: 6,
                      py: 1.5
                    }}
                  >
                    {submitting ? "Saving..." : isEditMode ? "Update Product" : "Publish Product"}
                  </Button>
                </div>
              </div>

            </form>
          </div>

          {/* Right: Live Preview Panel */}
          <div className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24">
              <ProductPreviewCard
                title={form.title}
                price={form.sellingPrice}
                imageUrl={images[0]?.url}
                sellingPrice={form.sellingPrice}
                costPrice={form.costPrice}
                discountPrice={form.discountPrice}
              />
              
              {/* Contextual Tips */}
              <div className="mt-6 bg-blue-50/50 rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="text-blue-500" size={18} />
                  <h4 className="font-semibold text-blue-900 text-sm">Best Practices</h4>
                </div>
                <ul className="text-sm text-blue-800 space-y-2 list-disc pl-4">
                  <li>Products with a video and 4+ high-quality images convert 30% better.</li>
                  <li>A catchy title and detailed description improve search visibility.</li>
                  <li>Adding complete variations (colors & sizes) reduces customer questions.</li>
                  <li>Linked products can increase your average order value by up to 15%.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PopupAlert
        type={popup.type as any}
        message={popup.message}
        confirmText="OK"
        onConfirm={() => setPopup((p) => ({ ...p, isOpen: false }))}
        show={popup.isOpen}
      />
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(ProductFormContent), { ssr: false });
