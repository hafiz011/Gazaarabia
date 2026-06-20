import { ProductVariant } from "@/hooks/useVariantManagement";

/**
 * Generate SKU for variant based on color, size, and base SKU
 */
export const generateVariantSKU = (
  baseProductCode: string,
  colorCode: string,
  sizeCode: string
): string => {
  if (!baseProductCode || !colorCode || !sizeCode) {
    return "";
  }
  return `${baseProductCode}-${colorCode}-${sizeCode}`.toUpperCase();
};

/**
 * Validate variant combination doesn't already exist
 */
export const isValidVariantCombination = (
  variants: ProductVariant[],
  colorId: string | number,
  sizeId: string | number,
  excludeIndex?: number
): boolean => {
  return !variants.some((v, idx) => {
    if (excludeIndex !== undefined && idx === excludeIndex) return false;
    return String(v.colorId) === String(colorId) && String(v.sizeId) === String(sizeId);
  });
};

/**
 * Get all unique color-size combinations
 */
export const getColorSizeCombinations = (variants: ProductVariant[]) => {
  return variants.map((v) => ({
    colorId: v.colorId,
    sizeId: v.sizeId,
    key: `${v.colorId}-${v.sizeId}`,
  }));
};

/**
 * Get missing size-color combinations from available options
 */
export const getMissingCombinations = (
  variants: ProductVariant[],
  colors: any[],
  sizes: any[]
) => {
  const existingCombinations = new Set(
    variants.map((v) => `${v.colorId}-${v.sizeId}`)
  );

  const missing: { colorId: string | number; sizeId: string | number }[] = [];

  for (const color of colors) {
    for (const size of sizes) {
      const key = `${color.id}-${size.id}`;
      if (!existingCombinations.has(key)) {
        missing.push({ colorId: color.id, sizeId: size.id });
      }
    }
  }

  return missing;
};

/**
 * Apply template variant to all missing sizes for a color
 */
export const applyTemplateToSizes = (
  variants: ProductVariant[],
  templateIndex: number,
  targetSizes: (string | number)[]
): ProductVariant[] => {
  if (templateIndex < 0 || templateIndex >= variants.length) {
    return variants;
  }

  const template = variants[templateIndex];
  const newVariants = [...variants];
  const existingSizes = new Set(
    variants
      .filter((v) => String(v.colorId) === String(template.colorId))
      .map((v) => String(v.sizeId))
  );

  for (const sizeId of targetSizes) {
    if (!existingSizes.has(String(sizeId))) {
      const newVariant: ProductVariant = {
        ...template,
        id: undefined,
        sizeId,
        sku: `${template.sku?.split("-").slice(0, -1).join("-") || ""}-${sizeId}`.replace(/^-|-$/, ""),
        images: template.images?.map((img) => ({ ...img, id: undefined })) || [],
      };
      newVariants.push(newVariant);
      existingSizes.add(String(sizeId));
    }
  }

  return newVariants;
};

/**
 * Apply template variant to all missing colors for a size
 */
export const applyTemplateToColors = (
  variants: ProductVariant[],
  templateIndex: number,
  targetColors: (string | number)[]
): ProductVariant[] => {
  if (templateIndex < 0 || templateIndex >= variants.length) {
    return variants;
  }

  const template = variants[templateIndex];
  const newVariants = [...variants];
  const existingColors = new Set(
    variants
      .filter((v) => String(v.sizeId) === String(template.sizeId))
      .map((v) => String(v.colorId))
  );

  for (const colorId of targetColors) {
    if (!existingColors.has(String(colorId))) {
      const newVariant: ProductVariant = {
        ...template,
        id: undefined,
        colorId,
        sku: `${template.sku?.split("-").slice(0, -1).join("-") || ""}-${colorId}`.replace(/^-|-$/, ""),
        images: template.images?.map((img) => ({ ...img, id: undefined })) || [],
      };
      newVariants.push(newVariant);
      existingColors.add(String(colorId));
    }
  }

  return newVariants;
};

/**
 * Share images from one color across all sizes
 */
export const shareImagesAcrossSizes = (
  variants: ProductVariant[],
  colorId: string | number,
  sourceImages: any[]
): ProductVariant[] => {
  return variants.map((v) => {
    if (String(v.colorId) === String(colorId)) {
      // Don't duplicate images if they already exist
      const existingUrls = new Set((v.images || []).map((img) => img.url));
      const newImages = sourceImages.filter((img) => !existingUrls.has(img.url));
      return {
        ...v,
        images: [...(v.images || []), ...newImages],
      };
    }
    return v;
  });
};

/**
 * Share images from one size across all colors
 */
export const shareImagesAcrossColors = (
  variants: ProductVariant[],
  sizeId: string | number,
  sourceImages: any[]
): ProductVariant[] => {
  return variants.map((v) => {
    if (String(v.sizeId) === String(sizeId)) {
      // Don't duplicate images if they already exist
      const existingUrls = new Set((v.images || []).map((img) => img.url));
      const newImages = sourceImages.filter((img) => !existingUrls.has(img.url));
      return {
        ...v,
        images: [...(v.images || []), ...newImages],
      };
    }
    return v;
  });
};

/**
 * Validate variant data before submission
 */
export const validateVariantData = (
  variant: ProductVariant
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!variant.colorId) errors.push("Color is required");
  if (!variant.sizeId) errors.push("Size is required");
  if (!variant.price) errors.push("Price is required");
  if (Number(variant.price) <= 0) errors.push("Price must be greater than 0");
  if (!variant.stock && variant.stock !== 0) errors.push("Stock is required");
  if (Number(variant.stock) < 0) errors.push("Stock cannot be negative");
  if (!variant.images || variant.images.length === 0) {
    errors.push("At least one image is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Build variant payload for API
 */
export const buildVariantPayload = (variant: ProductVariant) => {
  return {
    colorId: variant.colorId,
    sizeId: variant.sizeId,
    sku: variant.sku,
    price: parseFloat(String(variant.price)),
    stock: parseInt(String(variant.stock)),
    isActive: variant.isActive !== false,
    images: variant.images || [],
    videoUrl: variant.videoUrl || "",
    videoThumbnail: variant.videoThumbnail || "",
    ...(variant.id && { id: variant.id }),
  };
};
