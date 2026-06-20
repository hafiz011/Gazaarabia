import { useState, useCallback } from "react";

export interface VariantImage {
  id?: string | number;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id?: string | number;
  colorId: string | number;
  sizeId: string | number;
  sku: string;
  price: string | number;
  stock: string | number;
  isActive?: boolean;
  images: VariantImage[];
  videoUrl?: string;
  videoThumbnail?: string;
}

export interface VariantGroup {
  colorId: string | number;
  sizeId: string | number;
  variants: ProductVariant[];
}

interface UseVariantManagementProps {
  initialVariants?: ProductVariant[];
  onError?: (message: string) => void;
}

export const useVariantManagement = ({
  initialVariants = [],
  onError,
}: UseVariantManagementProps) => {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);

  // Check if color+size combination already exists
  const isDuplicateCombination = useCallback(
    (colorId: string | number, sizeId: string | number, excludeIndex?: number) => {
      return variants.some((v, idx) => {
        if (excludeIndex !== undefined && idx === excludeIndex) return false;
        return String(v.colorId) === String(colorId) && String(v.sizeId) === String(sizeId);
      });
    },
    [variants]
  );

  // Get all variants for a specific color (any size)
  const getVariantsByColor = useCallback(
    (colorId: string | number) => {
      return variants.filter((v) => String(v.colorId) === String(colorId));
    },
    [variants]
  );

  // Get all variants for a specific size (any color)
  const getVariantsBySize = useCallback(
    (sizeId: string | number) => {
      return variants.filter((v) => String(v.sizeId) === String(sizeId));
    },
    [variants]
  );

  // Get unique colors used in variants
  const getUsedColors = useCallback(() => {
    const colorSet = new Set(variants.map((v) => String(v.colorId)));
    return Array.from(colorSet);
  }, [variants]);

  // Get unique sizes used in variants
  const getUsedSizes = useCallback(() => {
    const sizeSet = new Set(variants.map((v) => String(v.sizeId)));
    return Array.from(sizeSet);
  }, [variants]
  );

  // Group variants by color with their sizes
  const getVariantsByColorGroup = useCallback(() => {
    const grouped: Record<string, ProductVariant[]> = {};
    variants.forEach((v) => {
      const colorKey = String(v.colorId);
      if (!grouped[colorKey]) grouped[colorKey] = [];
      grouped[colorKey].push(v);
    });
    return grouped;
  }, [variants]);

  // Group variants by size with their colors
  const getVariantsBySizeGroup = useCallback(() => {
    const grouped: Record<string, ProductVariant[]> = {};
    variants.forEach((v) => {
      const sizeKey = String(v.sizeId);
      if (!grouped[sizeKey]) grouped[sizeKey] = [];
      grouped[sizeKey].push(v);
    });
    return grouped;
  }, [variants]);

  // Add new variant
  const addVariant = useCallback(
    (variant: Partial<ProductVariant> = {}, basePrice?: string | number) => {
      const newVariant: ProductVariant = {
        colorId: "",
        sizeId: "",
        sku: "",
        price: basePrice || "",
        stock: "",
        isActive: true,
        images: [],
        videoUrl: "",
        videoThumbnail: "",
        ...variant,
      };
      setVariants((prev) => [...prev, newVariant]);
      return variants.length;
    },
    [variants.length]
  );

  // Update variant field
  const updateVariant = useCallback(
    (index: number, field: keyof ProductVariant, value: any) => {
      if (index < 0 || index >= variants.length) {
        onError?.(`Invalid variant index: ${index}`);
        return false;
      }

      // Check for duplicate color+size combination
      if ((field === "colorId" || field === "sizeId") && value) {
        const colorId = field === "colorId" ? value : variants[index].colorId;
        const sizeId = field === "sizeId" ? value : variants[index].sizeId;

        if (isDuplicateCombination(colorId, sizeId, index)) {
          onError?.(
            `This color and size combination already exists. Please choose different values.`
          );
          return false;
        }
      }

      setVariants((prev) =>
        prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
      );
      return true;
    },
    [variants, isDuplicateCombination, onError]
  );

  // Update variant images
  const updateVariantImages = useCallback(
    (index: number, images: VariantImage[]) => {
      return updateVariant(index, "images", images);
    },
    [updateVariant]
  );

  // Add image to variant
  const addImageToVariant = useCallback(
    (index: number, image: VariantImage) => {
      if (index < 0 || index >= variants.length) return false;
      const currentImages = variants[index].images || [];
      const newImages = [...currentImages, image];
      return updateVariant(index, "images", newImages);
    },
    [variants, updateVariant]
  );

  // Remove image from variant
  const removeImageFromVariant = useCallback(
    (variantIndex: number, imageIndex: number) => {
      if (variantIndex < 0 || variantIndex >= variants.length) return false;
      const currentImages = variants[variantIndex].images || [];
      const newImages = currentImages.filter((_, i) => i !== imageIndex);
      return updateVariant(variantIndex, "images", newImages);
    },
    [variants, updateVariant]
  );

  // Copy variant with option to clear color/size
  const copyVariant = useCallback(
    (index: number, options: { clearColor?: boolean; clearSize?: boolean } = {}) => {
      if (index < 0 || index >= variants.length) return;

      const variantToCopy = variants[index];
      const newVariant: ProductVariant = {
        ...variantToCopy,
        id: undefined,
        sku: "",
        images: variantToCopy.images?.map((img) => ({ ...img, id: undefined })) || [],
        colorId: options.clearColor ? "" : variantToCopy.colorId,
        sizeId: options.clearSize ? "" : variantToCopy.sizeId,
      };

      setVariants((prev) => {
        const newVariants = [...prev];
        newVariants.splice(index + 1, 0, newVariant);
        return newVariants;
      });
    },
    [variants]
  );

  // Copy variant for all sizes with same color
  const copyVariantToAllSizes = useCallback(
    (variantIndex: number, allSizeIds: (string | number)[]) => {
      if (variantIndex < 0 || variantIndex >= variants.length) return;

      const sourceVariant = variants[variantIndex];
      const usedSizes = getVariantsByColor(sourceVariant.colorId).map((v) => v.sizeId);
      const newVariants: ProductVariant[] = [];

      for (const sizeId of allSizeIds) {
        if (!usedSizes.includes(sizeId)) {
          const newVariant: ProductVariant = {
            ...sourceVariant,
            id: undefined,
            sizeId,
            sku: "",
            images: sourceVariant.images?.map((img) => ({ ...img, id: undefined })) || [],
          };
          newVariants.push(newVariant);
        }
      }

      if (newVariants.length > 0) {
        setVariants((prev) => [...prev, ...newVariants]);
      }
    },
    [variants, getVariantsByColor]
  );

  // Copy variant for all colors with same size
  const copyVariantToAllColors = useCallback(
    (variantIndex: number, allColorIds: (string | number)[]) => {
      if (variantIndex < 0 || variantIndex >= variants.length) return;

      const sourceVariant = variants[variantIndex];
      const usedColors = getVariantsBySize(sourceVariant.sizeId).map((v) => v.colorId);
      const newVariants: ProductVariant[] = [];

      for (const colorId of allColorIds) {
        if (!usedColors.includes(colorId)) {
          const newVariant: ProductVariant = {
            ...sourceVariant,
            id: undefined,
            colorId,
            sku: "",
            images: sourceVariant.images?.map((img) => ({ ...img, id: undefined })) || [],
          };
          newVariants.push(newVariant);
        }
      }

      if (newVariants.length > 0) {
        setVariants((prev) => [...prev, ...newVariants]);
      }
    },
    [variants, getVariantsBySize]
  );

  // Remove variant
  const removeVariant = useCallback((index: number) => {
    if (index < 0) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Validate all variants
  const validateVariants = useCallback(() => {
    const errors: string[] = [];

    if (variants.length === 0) {
      errors.push("At least one variant is required.");
      return { isValid: false, errors };
    }

    const seenCombinations = new Set<string>();

    variants.forEach((variant, idx) => {
      // Check required fields
      if (!variant.colorId) errors.push(`Variant #${idx + 1}: Color is required.`);
      if (!variant.sizeId) errors.push(`Variant #${idx + 1}: Size is required.`);
      if (!variant.price) errors.push(`Variant #${idx + 1}: Price is required.`);
      if (!variant.stock) errors.push(`Variant #${idx + 1}: Stock is required.`);
      if (!variant.images || variant.images.length === 0) {
        errors.push(`Variant #${idx + 1}: At least one image is required.`);
      }

      // Check for duplicates
      const key = `${variant.colorId}-${variant.sizeId}`;
      if (seenCombinations.has(key)) {
        errors.push(
          `Variant #${idx + 1}: Duplicate color-size combination detected.`
        );
      }
      seenCombinations.add(key);
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [variants]);

  // Bulk update variants with color image
  const bulkUpdateColorImage = useCallback(
    (colorId: string | number, image: VariantImage) => {
      const variantsWithColor = getVariantsByColor(colorId);
      setVariants((prev) =>
        prev.map((v) => {
          if (String(v.colorId) === String(colorId)) {
            const images = v.images || [];
            const existingImageIdx = images.findIndex(
              (img) => img.url === image.url
            );
            if (existingImageIdx === -1) {
              return { ...v, images: [image, ...images] };
            }
          }
          return v;
        })
      );
    },
    [getVariantsByColor]
  );

  return {
    variants,
    setVariants,
    addVariant,
    updateVariant,
    updateVariantImages,
    addImageToVariant,
    removeImageFromVariant,
    copyVariant,
    copyVariantToAllSizes,
    copyVariantToAllColors,
    removeVariant,
    validateVariants,
    isDuplicateCombination,
    getVariantsByColor,
    getVariantsBySize,
    getUsedColors,
    getUsedSizes,
    getVariantsByColorGroup,
    getVariantsBySizeGroup,
    bulkUpdateColorImage,
  };
};
