// EXAMPLE: How to integrate VariantsManager into ProductForm
// Replace your current variants section with this implementation

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// Import all needed services and types
import { productService } from "@/lib/services/seller/productService";
import { brandService } from "@/lib/services/brandService";
import { categoryService } from "@/lib/services/categoryService";
import { subcategoryService } from "@/lib/services/subcategoryService";
import { colorService } from "@/lib/services/colorService";
import { sizeService } from "@/lib/services/sizeService";

// Import the new VariantsManager component
import { VariantsManager } from "@/components/seller/VariantsManager";
import { ProductVariant } from "@/hooks/useVariantManagement";
import { buildVariantPayload } from "@/lib/variantUtils";

import AlertMessage from "@/components/AlertMessage";
import { Box, Button } from "@mui/material";

function ProductFormWithVariants() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const token: any = session?.user?.token;
  const id = params?.id?.[0];
  const isEditMode = Boolean(id);

  // Form state
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

  // ✅ Use the new variants management
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [images, setImages] = useState<any[]>([]);

  // Dropdown options
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [careAdvices, setCareAdvices] = useState<any[]>([]);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  // Fetch all dropdown data
  const fetchDropdownData = async () => {
    try {
      const [brandsData, categoriesData, subcatData, colorsData, sizesData, careData] =
        await Promise.all([
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

  // Fetch product for edit mode
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

      // ✅ Load variants with proper structure
      setVariants(
        (data.productvariant || []).map((v: any) => ({
          id: v.id,
          colorId: v.colorId,
          sizeId: v.sizeId,
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          isActive: v.isActive ?? true,
          images: v.variantImages || [],
          videoUrl: v.videoUrl || "",
          videoThumbnail: v.videoThumbnail || "",
        }))
      );
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

  // ✅ Handle variant changes from VariantsManager
  const handleVariantsChange = (newVariants: ProductVariant[]) => {
    setVariants(newVariants);
  };

  // ✅ IMPORTANT: Validate and submit with new variant structure
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Basic form validation
    if (images.length === 0) {
      setAlertMessage({
        isOpen: true,
        type: "warning",
        message: "Please upload at least one main product image.",
      });
      return;
    }

    if (!form.title || !form.description || !form.brandId || !form.categoryId) {
      setAlertMessage({
        isOpen: true,
        type: "warning",
        message: "Please fill in all basic product information.",
      });
      return;
    }

    // ✅ Validate variants
    if (variants.length === 0) {
      setAlertMessage({
        isOpen: true,
        type: "warning",
        message: "Please add at least one product variant.",
      });
      return;
    }

    // Check for missing required fields in each variant
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      const errors: string[] = [];

      if (!v.colorId) errors.push("Color");
      if (!v.sizeId) errors.push("Size");
      if (!v.sku) errors.push("SKU");
      if (!v.price) errors.push("Price");
      if (v.stock === "" || v.stock === undefined) errors.push("Stock");
      if (!v.images || v.images.length === 0) errors.push("Images");

      if (errors.length > 0) {
        setAlertMessage({
          isOpen: true,
          type: "warning",
          message: `Variant #${i + 1}: Missing ${errors.join(", ")}`,
        });
        return;
      }
    }

    if (!form.costPrice || !form.sellingPrice || !form.baseQty) {
      setAlertMessage({
        isOpen: true,
        type: "warning",
        message: "Please fill in all pricing and inventory details.",
      });
      return;
    }

    try {
      setSubmitting(true);

      // ✅ Build payload with properly formatted variants
      const payload = {
        ...form,
        images,
        variants: variants.map((v) => buildVariantPayload(v)),
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

  return (
    <Box className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-auto sm:h-16 py-3 sm:py-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900">
            {isEditMode ? "Update Product" : "Publish New Product"}
          </h1>
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="outlined"
              onClick={() => router.push("/seller/products")}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
              fullWidth
            >
              {submitting ? "..." : isEditMode ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-6 sm:py-8">
        {alertMessage.isOpen && alertMessage.type && (
          <AlertMessage
            type={alertMessage.type as any}
            message={alertMessage.message}
            onClose={() => setAlertMessage((p) => ({ ...p, isOpen: false }))}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info Section */}
          {/* ... your existing form sections ... */}

          {/* ✅ VARIANTS SECTION - REPLACED with VariantsManager */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <VariantsManager
              variants={variants}
              onVariantsChange={handleVariantsChange}
              colors={colors}
              sizes={sizes}
              basePrice={form.sellingPrice}
              onError={(msg) =>
                setAlertMessage({
                  isOpen: true,
                  type: "error",
                  message: msg,
                })
              }
            />
          </div>

          {/* Submit Section */}
          <div className="mt-8 flex items-center justify-end border-t border-gray-200 pt-6">
            <div className="flex gap-4">
              <Button
                variant="outlined"
                onClick={() => router.push("/seller/products")}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : isEditMode
                  ? "Update Product"
                  : "Publish Product"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Box>
  );
}

export default dynamic(() => Promise.resolve(ProductFormWithVariants), {
  ssr: false,
});

// ============================================================
// KEY CHANGES FROM OLD IMPLEMENTATION:
// ============================================================

// OLD: Manual variant management with individual handlers
// const [variants, setVariants] = useState<any[]>([]);
// const handleVariantAdd = () => { ... };
// const handleVariantChange = (idx, field, value) => { ... };
// const handleVariantRemove = (idx) => { ... };
// const handleVariantCopy = (idx) => { ... };

// NEW: Centralized variant management with VariantsManager
// const [variants, setVariants] = useState<ProductVariant[]>([]);
// <VariantsManager variants={variants} onVariantsChange={setVariants} ... />

// BENEFITS:
// ✅ Duplicate color-size detection built-in
// ✅ Bulk add variants from colors × sizes grid
// ✅ Copy to all sizes or colors with one click
// ✅ Better image management per variant
// ✅ Proper validation before submit
// ✅ Cleaner code, less boilerplate
// ✅ Reusable across projects

// ============================================================
// VARIANT DATA STRUCTURE CHANGE:
// ============================================================

// OLD:
// variants: [
//   { colorId: "", sizeId: "", sku: "", price: "", stock: "", images: [] }
// ]

// NEW: (with buildVariantPayload)
// variants: [
//   {
//     colorId: 123,
//     sizeId: 456,
//     sku: "PROD-RED-M",
//     price: 29.99,
//     stock: 50,
//     isActive: true,
//     images: [{ url: "...", alt: "...", isPrimary: true }],
//     videoUrl: "",
//     videoThumbnail: ""
//   }
// ]

// When submitted to API: buildVariantPayload(v) ensures:
// - colorId & sizeId are strings/numbers (as from form)
// - price is parsed as float
// - stock is parsed as integer
// - images array is properly formatted
// - id included only for updates
