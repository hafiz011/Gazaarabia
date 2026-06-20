"use client";

import { Box } from "@mui/material";
import { ProductVariant } from "@/hooks/useVariantManagement";
import { VariantsGridManager } from "./VariantsGridManager";
import { VariantsQuickAdd } from "./VariantsQuickAdd";

interface VariantsTikTokStyleProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  colors: any[];
  sizes: any[];
  basePrice?: string | number;
  onError?: (message: string) => void;
}

/**
 * TikTok-style variant management interface
 * Features:
 * - Quick add dialog with color/size selection
 * - Clean table/grid view with inline editing
 * - Bulk operations (select, template, delete)
 * - Visual progress indicators
 * - Color swatches
 * - Status toggle (active/inactive)
 * - Quick stats dashboard
 */
export const VariantsTikTokStyle = ({
  variants,
  onVariantsChange,
  colors,
  sizes,
  basePrice,
  onError,
}: VariantsTikTokStyleProps) => {
  const handleAddVariants = (newVariants: ProductVariant[]) => {
    onVariantsChange([...variants, ...newVariants]);
  };

  return (
    <Box className="space-y-6">
      {/* Header with Quick Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Variants</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage colors, sizes, and inventory for your product
          </p>
        </div>
        <VariantsQuickAdd
          onVariantsAdd={handleAddVariants}
          colors={colors}
          sizes={sizes}
          basePrice={basePrice}
          existingVariants={variants}
          onError={onError}
        />
      </div>

      {/* Grid Manager */}
      <VariantsGridManager
        variants={variants}
        onVariantsChange={onVariantsChange}
        colors={colors}
        sizes={sizes}
        basePrice={basePrice}
        onError={onError}
      />
    </Box>
  );
};
