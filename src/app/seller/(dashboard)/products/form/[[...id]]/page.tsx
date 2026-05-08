"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Plus, Check, ImageIcon, Info, Layers, DollarSign, Shirt, Eye, AlertCircle, ShoppingBag, ChevronRight, ChevronLeft } from "lucide-react";
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
// import { uploadService } from "@/lib/services/uploadService";
import { materialCareService } from "@/lib/services/materialCareService";

import { TextField, MenuItem, Box, Button, Popover } from "@mui/material";
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
  const [allSubcategories, setAllSubcategories] = useState<any[]>([]);
  const [categoryAnchorEl, setCategoryAnchorEl] = useState<null | HTMLElement>(null);
  const [hoveredCategory, setHoveredCategory] = useState<any | null>(null);
  const [drillDownCategory, setDrillDownCategory] = useState<any | null>(null);
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
      const subList = subcatData.data ?? subcatData;
      setSubcategories(subList);
      setAllSubcategories(subList);
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
      if (!v.colorId || !v.sizeId || !v.price || !v.stock)
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

    if (!form.title || !form.description || !form.brandId || !form.categoryId) {
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

    if (!form.costPrice || !form.sellingPrice || !form.baseQty) {
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
      const res = await productService.getAll(token, { search: searchQuery });
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
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-blue-600" size={20} />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              {isEditMode ? "Update Product" : "Publish New Product"}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outlined"
              onClick={() => router.push("/seller/products")}
              fullWidth
              sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 600, borderColor: '#E2E8F0', color: '#64748B', py: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              fullWidth
              disabled={submitting}
              sx={{ background: "var(--brand-secondary, #2563eb)", textTransform: 'none', borderRadius: '8px', fontWeight: 600, boxShadow: 'none', py: 1 }}
            >
              {submitting ? "..." : isEditMode ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
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
                <div className="mb-6 flex items-start sm:items-center gap-2">
                  <ImageIcon className="text-blue-600 mt-1 sm:mt-0" size={24} />
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Product Media</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload high-quality images and video to showcase your product.</p>
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
                {/* Product Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Info className="text-blue-600" size={24} />
                    Product Details
                  </h2>

                  <div className="space-y-6">
                    <TextField
                      label={<RequiredLabel text="Product Name" />}
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      fullWidth
                      sx={fieldStyle}
                      placeholder="e.g., Premium Cotton T-Shirt"
                    />

                    <div className="relative">
                      <TextField
                        label={<RequiredLabel text="Category & Subcategory" />}
                        value={(() => {
                          const sub = allSubcategories.find((s) => String(s.id) === String(form.subcategoryId));
                          const cat = categories.find((c) => String(c.id) === String(sub?.categoryId));
                          return cat && sub ? `${cat.name} - ${sub.name}` : "";
                        })()}
                        onClick={(e) => setCategoryAnchorEl(e.currentTarget)}
                        fullWidth
                        autoComplete="off"
                        sx={fieldStyle}
                        placeholder="Select Category & Subcategory"
                        InputProps={{
                          readOnly: true,
                          endAdornment: <ChevronRight size={18} className={`text-gray-400 transition-transform ${categoryAnchorEl ? 'rotate-90' : ''}`} />,
                          sx: { cursor: 'pointer', '& input': { cursor: 'pointer' } }
                        }}
                      />

                      <Popover
                        open={Boolean(categoryAnchorEl)}
                        anchorEl={categoryAnchorEl}
                        onClose={() => setCategoryAnchorEl(null)}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'left',
                        }}
                        transformOrigin={{
                          vertical: 'top',
                          horizontal: 'left',
                        }}
                        PaperProps={{
                          sx: {
                            mt: 1,
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden',
                            width: { xs: 'calc(100vw - 32px)', sm: '500px' }, // Total width for two columns
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' }
                          }
                        }}
                      >
                        {/* Categories Column */}
                        <div className="w-full sm:w-1/2 border-r border-slate-100 py-2 bg-slate-50 overflow-y-auto max-h-[300px] sm:max-h-[400px]">
                          <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categories</p>
                          {[...categories].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map((cat) => (
                            <div
                              key={cat.id}
                              onMouseEnter={() => setHoveredCategory(cat)}
                              onClick={() => {
                                // On mobile, clicking a category should also set it for subcategory view
                                setHoveredCategory(cat);
                              }}
                              className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${hoveredCategory?.id === cat.id
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                              <span className="text-sm font-medium">{cat.name}</span>
                              <ChevronRight size={14} className={hoveredCategory?.id === cat.id ? 'text-white' : 'text-slate-400'} />
                            </div>
                          ))}
                        </div>
 
                        {/* Subcategories Column */}
                        <div className="w-full sm:w-1/2 py-2 bg-white overflow-y-auto max-h-[300px] sm:max-h-[400px]">
                          {hoveredCategory ? (
                            <>
                              <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {hoveredCategory.name} Subcategories
                              </p>
                              {allSubcategories
                                .filter((s) => String(s.categoryId) === String(hoveredCategory.id))
                                .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                                .map((sub) => (
                                  <div
                                    key={sub.id}
                                    onClick={() => {
                                      setForm((prev) => ({
                                        ...prev,
                                        subcategoryId: String(sub.id),
                                        categoryId: String(sub.categoryId),
                                      }));
                                      setCategoryAnchorEl(null);
                                    }}
                                    className="px-4 py-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 cursor-pointer transition-colors"
                                  >
                                    {sub.name}
                                  </div>
                                ))}
                              {allSubcategories.filter((s) => String(s.categoryId) === String(hoveredCategory.id)).length === 0 && (
                                <div className="px-4 py-8 text-center text-slate-400 text-sm">
                                  No subcategories found
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="h-full flex items-center justify-center p-8 text-center text-slate-400 text-sm italic">
                              Hover over a category to see subcategories
                            </div>
                          )}
                        </div>
                      </Popover>
                    </div>

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

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Specifications (Add 4 or 5 key Benefits and Features) <span className="text-red-500">*</span></label>
                      <RichTextEditor
                        value={form.shortDescription}
                        onChange={(value) => setForm((prev) => ({ ...prev, shortDescription: value }))}
                        minHeight={250}
                        placeholder="Brief summary for specifications..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Description <span className="text-red-500">*</span></label>
                      <RichTextEditor
                        value={form.description}
                        onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
                        minHeight={400}
                        placeholder="Detailed features, materials..."
                      />
                    </div>

                    <TextField
                      select
                      label={<RequiredLabel text="Material & Care Guide" />}
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


                    {/* </div> */}
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
                      startAdornment: <span className="text-gray-500 mr-2">£</span>,
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
                      startAdornment: <span className="text-gray-500 mr-2">£</span>,
                    }}
                  />
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
                    label="Barcode (EAN/UPC)"
                    name="barcode"
                    value={form.barcode}
                    onChange={handleInputChange}
                    fullWidth
                    sx={fieldStyle}
                  />
                </div>
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
