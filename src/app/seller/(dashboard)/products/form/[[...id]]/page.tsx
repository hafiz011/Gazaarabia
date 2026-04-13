"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Trash2, Copy } from "lucide-react";
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
// import { ambassadorService } from "@/lib/services/ambassadorService";


function ProductFormContent() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const token: any = session?.user?.token; // get token
  const id = params?.id?.[0];
  const isEditMode = Boolean(id);

  const allowedRoles = ["seller"]; // only seller and seller can access

  useEffect(() => {
    if (!session) return;

    const userRole = session?.user?.role?.toLowerCase();
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
    // ambassadorId: "",
    // soldHighlightDuration: "",
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
  const [ambassadors, setAmbassadors] = useState<any[]>([]);

  // Wear with related

  const [wearWith, setWearWith] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedWearWith, setSelectedWearWith] = useState<number[]>([]);





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

  //  Fetch dropdown data
  const fetchDropdownData = async () => {
    try {
      const [
        brandsData,
        categoriesData,
        subcatData,
        colorsData,
        sizesData,
        careData,
        // ambassadorData,
      ]: any = await Promise.all([
        brandService.getAll(token),
        categoryService.getAll(token),
        subcategoryService.getAll(token),
        colorService.getAll(token),
        sizeService.getAll(token),
        materialCareService.getAll(token),
        // ambassadorService.getAll(token), --- IGNORE ---
      ]);

      setBrands(brandsData.data ?? brandsData);
      setCategories(categoriesData.data ?? categoriesData);
      setSubcategories(subcatData.data ?? subcatData);
      setColors(colorsData.data ?? colorsData);
      setSizes(sizesData.data ?? sizesData);
      setCareAdvices(careData.data ?? careData);
      // setAmbassadors(ambassadorData.data ?? ambassadorData);

    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Failed to load dropdown data.",
      });
    }
  };

  // Fetch product if edit mode
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
        // ambassadorId: data.ambassadorId || "",
        // soldHighlightDuration: data.soldHighlightDuration || "",
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
      // setImages(data.images || []);
      setImages(data.productimage || []);
      // setVariants(data.productvariant || []);
      setVariants(
        (data.productvariant || []).map((v: any) => ({
          ...v,
          images: v.variantImages || [],
        }))
      );
      setWearWith(data.wearWith || []); // load wear-with products if editing

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

  //  Handle form input
  const handleInputChange = async (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // When category changes -> load its subcategories
    if (name === "categoryId") {
      setForm((prev) => ({ ...prev, subcategoryId: "" })); // reset subcategory

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

  //  Upload Image
  const handleFileChange = async (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    if (!files.length) return;

    try {
      const urls = await uploadService.uploadMultiple(files, "products");
      setImages((prev) => [
        ...prev,
        ...urls.map((url: any) => ({
          url,
          alt: "",
          colorId: "",
          primary: false,
        })),
      ]);
    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Image upload failed.",
      });
    }
  };


  //  Add variant
  const handleVariantAdd = () => {
    setVariants((prev) => [
      ...prev,
      { colorId: "", sizeId: "", sku: "", price: "", stock: "", isActive: true, images: [], videoUrl: "", videoThumbnail: "" },
    ]);
  };

  //  Change variant
  const handleVariantChange = (idx: number, field: string, value: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  //  Remove variant
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

  //  Submit
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

    if (variants.length == 0) {
      setPopup({
        isOpen: true,
        type: "warning",
        message:
          "Please add at least one variant.",
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
      const payload = { ...form, images, variants, wearWith: wearWith.map((w) => w.id) };


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

  const RequiredLabel = ({ text }: { text: string }) => (
    <span>
      {text} <span className="text-red-600">*</span>
    </span>
  );



  //======================== Wear with section ==================

  const handleSearchProducts = async (pageNum = 1) => {
    if (!searchQuery.trim()) return;
    try {
      setIsSearching(true);
      // const res = await productService.getAll(token, searchQuery, pageNum, 5);
      const res = await productService.getAll(token, searchQuery);

      const products = res.data ?? [];
      setHasMore(products.length === 5); // detect if next page exists
      if (pageNum === 1) {
        setSearchResults(products.filter((p: any) => p.id !== Number(id)));
      } else {
        setSearchResults((prev) => [
          ...prev,
          ...products.filter((p: any) => p.id !== Number(id)),
        ]);
      }
      setPage(pageNum);
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


  //  Add product to Wear With list
  const handleAddWearWith = (product: any) => {
    if (!wearWith.find((p) => p.id === product.id)) {
      setWearWith((prev) => [...prev, product]);
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  //  Remove product from Wear With list
  const handleRemoveWearWith = (id: number | string) => {
    setWearWith((prev) => prev.filter((p) => p.id !== id));
  };


  //  Toggle selection
  const toggleWearWithSelection = (id: number) => {
    setSelectedWearWith((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  //  Add selected to wearWith
  const handleAddSelectedWearWith = () => {
    const selectedProducts = searchResults.filter((p) =>
      selectedWearWith.includes(p.id)
    );
    setWearWith((prev) => {
      const newOnes = selectedProducts.filter(
        (prod) => !prev.find((p) => p.id === prod.id)
      );
      return [...prev, ...newOnes];
    });
    setSelectedWearWith([]);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleVariantCopy = (idx: number) => {
    setVariants((prev) => {
      const variantToCopy = prev[idx];

      const newVariant = {
        ...variantToCopy,
        id: undefined,
        sku: "", // must be unique, so reset
      };

      const newVariants = [...prev];
      newVariants.splice(idx + 1, 0, newVariant); // insert after current

      return newVariants;
    });
  };

  // handle the video file change
  const handleVideoFileChange = async (e:any,idx:number) => {

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Video must be under 15MB",
      });
      return;
    }

    try {
     const videoUrl = await uploadService.uploadVideo(file,"variant-videos");

      handleVariantChange(idx, "videoUrl", videoUrl);
      handleVariantChange(idx, "videoThumbnail", ""); // optional: auto-generate later
    } catch {
      setAlertMessage({
        isOpen: true,
        type: "error",
        message: "Variant video upload failed.",
      });
    }

  }


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

      {/*  Full UI inside form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/*  Basic Info */}
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

          <TextField
            label={<RequiredLabel text="Slug" />}
            name="slug"
            value={form.slug}
            onChange={handleInputChange}
            inputProps={{ required: true }}
            fullWidth
            sx={fieldStyle}
          />


          <TextField label={<RequiredLabel text="Title" />} name="title" value={form.title}
            onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />

          <TextField label={<RequiredLabel text="Short Description" />} name="shortDescription"
            value={form.shortDescription} onChange={handleInputChange} inputProps={{ required: true }}
            fullWidth multiline rows={2} sx={fieldStyle} />

          <TextField label={<RequiredLabel text="Description" />} name="description"
            value={form.description} onChange={handleInputChange} inputProps={{ required: true }}
            fullWidth multiline rows={3} sx={fieldStyle} />

          <TextField select label={<RequiredLabel text="Care Advice" />} name="materialCareId"
            value={form.materialCareId} onChange={handleInputChange} inputProps={{ required: true }}
            fullWidth sx={fieldStyle}>
            {careAdvices.map((care) => (
              <MenuItem key={care.id} value={care.id}>
                {care.title} ({care.material})
              </MenuItem>
            ))}
          </TextField>



          {/* <TextField
            select
            label="Assign Ambassador"
            name="ambassadorId"
            value={form.ambassadorId}
            onChange={handleInputChange}
            fullWidth
            sx={fieldStyle}
          >
            <MenuItem value="">None</MenuItem>
            {ambassadors.map((a) => (
              <MenuItem key={a.id} value={a.id}>
                {a.user.name} ({a.user.email})
              </MenuItem>
            ))}
          </TextField> */}


          {/* <TextField
            label="Highlight Duration (Hours)"
            name="soldHighlightDuration"
            type="number"
            value={form.soldHighlightDuration || ""}
            onChange={handleInputChange}
            fullWidth
            sx={fieldStyle}
            placeholder="Example: 24 (means 24 hours)"
          /> */}

          <TextField
            label="Sold Count in Duration"
            name="soldCount"
            type="number"
            value={form.soldCount || ""}
            onChange={handleInputChange}
            fullWidth
            sx={fieldStyle}
            placeholder="Example: 12"
          />


          {/* <TextField label={<RequiredLabel text="Subcategory" />} select name="subcategoryId"
            value={form.subcategoryId} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle}>
            {subcategories.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
          </TextField> */}


        </Box>

        {/*  Pricing */}
        <Box className="bg-white p-6 rounded-xl shadow space-y-4">
          <TextField label={<RequiredLabel text="Cost Price" />} name="costPrice" type="number"
            value={form.costPrice} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          <TextField label={<RequiredLabel text="Selling Price" />} name="sellingPrice" type="number"
            value={form.sellingPrice} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          {/* <TextField label={<RequiredLabel text="Discount Price" />} name="discountPrice" type="number"
            value={form.discountPrice} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} /> */}
          <TextField label={<RequiredLabel text="Base Qty" />} name="baseQty" type="number"
            value={form.baseQty} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />
          <TextField label={<RequiredLabel text="Barcode" />} name="barcode"
            value={form.barcode} onChange={handleInputChange} inputProps={{ required: true }} fullWidth sx={fieldStyle} />

          {/* <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" name="active" checked={form.active} onChange={handleInputChange}
              className="w-4 h-4 accent-[var(--brand-secondary)] cursor-pointer" />
            <label htmlFor="active" className="text-gray-700 font-medium cursor-pointer">Active</label>
          </div> */}
        </Box>

        {/*  Images */}
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
            <input ref={fileInputRef} type="file" multiple accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={handleFileChange} className="hidden" />
          </div>
        </Box>

        {/*  Variants */}
        <Box className="lg:col-span-2 bg-white p-6 rounded-xl shadow space-y-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Variants (Color × Size)</h2>
            <Button variant="contained" sx={{ background: "var(--brand-secondary)" }} onClick={handleVariantAdd}>
              <Plus size={16} style={{ marginRight: 4 }} /> Add Variant
            </Button>
          </div>

          {variants.map((v, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/*  Header with title + delete button */}
              {/* <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">
                  Variant #{idx + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => handleVariantRemove(idx)}
                  className="text-red-500 hover:text-red-700 transition flex items-center gap-1"
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div> */}

              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-800">
                  Variant #{idx + 1}
                </h3>

                <div className="flex gap-2">
                  {/* COPY BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleVariantCopy(idx)}
                    title="Copy Variant"
                    className="p-2 rounded-md border border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition"
                  >
                    <Copy size={16} />
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleVariantRemove(idx)}
                    title="Remove Variant"
                    className="p-2 rounded-md border border-gray-300 text-red-500 hover:bg-red-50 hover:border-red-400 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>


              {/*  Main Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TextField
                  select
                  label={<RequiredLabel text="Color" />}
                  value={v.colorId}
                  onChange={(e) => handleVariantChange(idx, "colorId", e.target.value)}
                  inputProps={{ required: true }}
                  fullWidth
                  sx={fieldStyle}
                >
                  {colors.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label={<RequiredLabel text="Size" />}
                  value={v.sizeId}
                  onChange={(e) => handleVariantChange(idx, "sizeId", e.target.value)}
                  inputProps={{ required: true }}
                  fullWidth
                  sx={fieldStyle}
                >
                  {sizes.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  label={<RequiredLabel text="SKU" />}
                  value={v.sku}
                  onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                  inputProps={{ required: true }}
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  label={<RequiredLabel text="Price" />}
                  type="number"
                  value={v.price}
                  onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                  inputProps={{ required: true }}
                  fullWidth
                  sx={fieldStyle}
                />

                <TextField
                  label={<RequiredLabel text="Stock" />}
                  type="number"
                  value={v.stock}
                  onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                  inputProps={{ required: true }}
                  fullWidth
                  sx={fieldStyle}
                />
              </div>

              {/*  Variant Images */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Variant Images
                </label>

                <div className="flex flex-wrap gap-3 mt-2">
                  {v.images?.map((img: any, i: number) => (
                    <div key={i} className="relative group">
                      <img
                        src={img.url}
                        alt=""
                        className="w-20 h-20 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleVariantChange(
                            idx,
                            "images",
                            v.images.filter((_: any, j: any) => j !== i)
                          )
                        }
                        className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Upload Button */}
                  <div
                    onClick={() => document.getElementById(`variantFile${idx}`)?.click()}
                    className="w-20 h-20 border-2 border-dashed rounded flex items-center justify-center cursor-pointer text-gray-400 hover:text-black transition"
                  >
                    <Upload size={18} />
                  </div>

                  <input
                    id={`variantFile${idx}`}
                    type="file"
                    multiple
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;
                      try {
                        const urls = await uploadService.uploadMultiple(files, "variants");
                        handleVariantChange(idx, "images", [
                          ...(v.images || []),
                          ...urls.map((url: any) => ({ url, alt: "" })),
                        ]);
                      } catch {
                        setAlertMessage({
                          isOpen: true,
                          type: "error",
                          message: "Variant image upload failed.",
                        });
                      }
                    }}
                  />
                </div>
              </div>

              {/* Variant Video */}
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">
                  Variant Video (Optional – only one)
                </label>

                {v.videoUrl ? (
                  <div className="relative mt-2 w-40">
                    <video
                      src={v.videoUrl}
                      poster={v.videoThumbnail}
                      controls
                      className="w-full rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        handleVariantChange(idx, "videoUrl", "");
                        handleVariantChange(idx, "videoThumbnail", "");
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById(`variantVideo${idx}`)?.click()}
                    className="mt-2 w-40 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer text-gray-400 hover:text-black"
                  >
                    <Upload size={18} />
                    <span className="text-xs ml-2">Upload Video</span>
                  </div>
                )}

                <input
                  id={`variantVideo${idx}`}
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => handleVideoFileChange(e,idx)}
                />
              </div>


              {/* Footer - Active toggle */}
              {/* <div className="flex justify-end items-center mt-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={v.isActive}
                    onChange={(e) =>
                      handleVariantChange(idx, "isActive", e.target.checked)
                    }
                    className="w-4 h-4 accent-[var(--brand-secondary)]"
                  />
                  Active
                </label>
              </div> */}
            </div>
          ))}

        </Box>



        {/*  Wear With Section */}
        <Box className="lg:col-span-2 bg-white p-6 rounded-xl shadow space-y-4 mt-6">
          <h2 className="text-lg font-semibold">Wear With</h2>
          <p className="text-sm text-gray-500">
            Link related products that go well with this item.
          </p>

          {/*  Search Input & Button */}
          <div className="flex items-center gap-3">
            <TextField
              label="Search Products"
              placeholder="Type to search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "42px", //  Match button height
                },
              }}
            />
            <Button
              variant="contained"
              sx={{
                background: "var(--brand-secondary)",
                height: "42px",
                whiteSpace: "nowrap",
                textTransform: "none",
                px: 3,
                "&:hover": {
                  background: "var(--brand-primary)",
                },
              }}
              disabled={isSearching}
              onClick={() => handleSearchProducts(1)}
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {/*  Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-gray-50 border rounded-lg p-3 max-h-64 overflow-y-auto">
              {searchResults.map((prod) => (
                <label
                  key={prod.id}
                  className="flex justify-between items-center py-2 border-b last:border-none cursor-pointer hover:bg-gray-100 px-2 rounded-md transition"
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedWearWith.includes(prod.id)}
                      onChange={() => toggleWearWithSelection(prod.id)}
                      className="w-4 h-4 text-[var(--brand-secondary)] border-gray-300 rounded focus:ring-[var(--brand-secondary)]"
                    />
                    <img
                      src={prod?.productimage?.[0]?.url || "/images/placeholder.jpg"}
                      alt={prod.title}
                      className="w-10 h-10 rounded object-cover border"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {prod.title}
                    </span>
                  </div>

                  {/*  Optional Quick Add Button */}
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      background: "var(--brand-secondary)",
                      textTransform: "none",
                      fontSize: "13px",
                      "&:hover": {
                        background: "var(--brand-primary)",
                      },
                    }}
                    onClick={() => handleAddWearWith(prod)}
                  >
                    Add
                  </Button>
                </label>
              ))}

              {/* Add Selected Button */}
              {selectedWearWith.length > 0 && (
                <div className="text-right mt-3">
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      background: "var(--brand-secondary)",
                      textTransform: "none",
                      fontSize: "13px",
                      px: 3,
                      "&:hover": {
                        background: "var(--brand-primary)",
                      },
                    }}
                    onClick={handleAddSelectedWearWith}
                  >
                    Add Selected ({selectedWearWith.length})
                  </Button>
                </div>
              )}

              {/* Load More */}
              {hasMore && (
                <div className="text-center mt-3">
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderColor: "var(--brand-secondary)",
                      color: "var(--brand-secondary)",
                      textTransform: "none",
                      fontSize: "13px",
                      px: 3,
                      "&:hover": {
                        borderColor: "var(--brand-primary)",
                        color: "var(--brand-primary)",
                      },
                    }}
                    onClick={() => handleSearchProducts(page + 1)}
                  >
                    Load More
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Selected Wear With Items */}
          {wearWith.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {wearWith.map((prod) => (
                <div
                  key={prod.id}
                  className="relative border rounded-lg p-2 w-32 h-40 flex flex-col items-center justify-center bg-gray-50"
                >
                  <img
                    src={prod?.productimage?.[0]?.url || "/images/placeholder.jpg"}
                    alt={prod.title}
                    className="w-20 h-20 object-cover rounded mb-2"
                  />
                  <span className="text-xs text-center font-medium line-clamp-2">
                    {prod.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWearWith(prod.id)}
                    className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Box>





        {/* Actions */}
        <Box className="lg:col-span-2 flex justify-end gap-3 mt-6">
          <Button variant="outlined" onClick={() => router.push("/seller/products")}>
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
