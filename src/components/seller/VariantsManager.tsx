"use client";

import { useState } from "react";
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormGroup, FormControlLabel } from "@mui/material";
import { Plus, AlertCircle } from "lucide-react";
import { VariantCardV2 } from "./VariantCardV2";
import { useVariantManagement, ProductVariant } from "@/hooks/useVariantManagement";
import {
  getMissingCombinations,
  applyTemplateToSizes,
  applyTemplateToColors,
  shareImagesAcrossSizes,
  shareImagesAcrossColors,
} from "@/lib/variantUtils";

interface VariantsManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  colors: any[];
  sizes: any[];
  basePrice?: string | number;
  onError?: (message: string) => void;
}

export const VariantsManager = ({
  variants: initialVariants,
  onVariantsChange,
  colors,
  sizes,
  basePrice,
  onError,
}: VariantsManagerProps) => {
  const [bulkAddDialog, setBulkAddDialog] = useState(false);
  const [selectedColors, setSelectedColors] = useState<(string | number)[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<(string | number)[]>([]);

  const {
    variants,
    addVariant,
    updateVariant,
    removeVariant,
    copyVariant,
    copyVariantToAllSizes,
    copyVariantToAllColors,
    isDuplicateCombination,
    getVariantsByColor,
  } = useVariantManagement({
    initialVariants,
    onError,
  });

  // Sync with parent
  const handleVariantsSync = (newVariants: ProductVariant[]) => {
    onVariantsChange(newVariants);
  };

  const handleAddVariant = () => {
    addVariant({}, basePrice);
    handleVariantsSync(variants);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const success = updateVariant(index, field, value);
    if (success) {
      handleVariantsSync(variants);
    }
  };

  const handleRemoveVariant = (index: number) => {
    removeVariant(index);
    handleVariantsSync(variants);
  };

  const handleCopyVariant = (index: number) => {
    copyVariant(index);
    handleVariantsSync(variants);
  };

  const handleCopyToAllSizes = (index: number) => {
    const sizeIds = sizes.map((s) => s.id);
    copyVariantToAllSizes(index, sizeIds);
    handleVariantsSync(variants);
  };

  const handleCopyToAllColors = (index: number) => {
    const colorIds = colors.map((c) => c.id);
    copyVariantToAllColors(index, colorIds);
    handleVariantsSync(variants);
  };

  // Bulk add variants for selected colors & sizes
  const handleBulkAdd = () => {
    if (selectedColors.length === 0 || selectedSizes.length === 0) {
      onError?.("Please select at least one color and one size.");
      return;
    }

    const newVariants = [...variants];
    for (const colorId of selectedColors) {
      for (const sizeId of selectedSizes) {
        if (!isDuplicateCombination(colorId, sizeId)) {
          newVariants.push({
            colorId,
            sizeId,
            sku: "",
            price: basePrice || "",
            stock: "",
            isActive: true,
            images: [],
            videoUrl: "",
            videoThumbnail: "",
          });
        }
      }
    }

    onVariantsChange(newVariants);
    setBulkAddDialog(false);
    setSelectedColors([]);
    setSelectedSizes([]);
  };

  const missingCombinations = getMissingCombinations(variants, colors, sizes);
  const duplicateIndices = new Set(
    variants
      .map((v, idx) => (isDuplicateCombination(v.colorId, v.sizeId, idx) ? idx : -1))
      .filter((idx) => idx !== -1)
  );

  return (
    <Box>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg
              className="text-blue-600"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
            </svg>
            Product Variants
          </h2>
          <p className="text-gray-500 mt-1">
            Add different colors, sizes, and manage images per variant.
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outlined"
            onClick={() => setBulkAddDialog(true)}
            disabled={colors.length === 0 || sizes.length === 0}
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              py: 1.5,
            }}
          >
            Bulk Add
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={handleAddVariant}
            sx={{
              background: "var(--brand-secondary, #2563eb)",
              whiteSpace: "nowrap",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "none",
              px: 3,
              py: 1.5,
            }}
            startIcon={<Plus size={20} />}
          >
            Add New Variant
          </Button>
        </div>
      </div>

      {/* Missing combinations warning */}
      {missingCombinations.length > 0 && (
        <div className="mb-6 bg-blue-50 rounded-xl p-4 flex gap-3 items-start border border-blue-200">
          <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-900">
            <p className="font-semibold mb-1">
              {missingCombinations.length} missing color-size combinations
            </p>
            <p className="text-blue-800/80">
              You have {colors.length} colors and {sizes.length} sizes. Consider using bulk add or copy features to create all combinations.
            </p>
          </div>
        </div>
      )}

      {variants.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <svg
              className="text-gray-400"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No variants created
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create variants to offer different options like colors and sizes for your product.
          </p>
          <Button
            type="button"
            variant="outlined"
            onClick={handleAddVariant}
            sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
          >
            Create First Variant
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {variants.map((variant, idx) => (
            <VariantCardV2
              key={idx}
              variant={variant}
              index={idx}
              colors={colors}
              sizes={sizes}
              isDuplicate={duplicateIndices.has(idx)}
              onVariantChange={(field, value) =>
                handleUpdateVariant(idx, field, value)
              }
              onVariantRemove={() => handleRemoveVariant(idx)}
              onVariantCopy={() => handleCopyVariant(idx)}
              onCopyToAllSizes={() => handleCopyToAllSizes(idx)}
              onCopyToAllColors={() => handleCopyToAllColors(idx)}
              onError={onError || (() => {})}
              autoFillPrice={basePrice}
            />
          ))}
        </div>
      )}

      {/* Bulk Add Dialog */}
      <Dialog open={bulkAddDialog} onClose={() => setBulkAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Add Variants</DialogTitle>
        <DialogContent className="space-y-6 py-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Select Colors</h4>
            <FormGroup>
              {colors.map((color) => (
                <FormControlLabel
                  key={color.id}
                  control={
                    <Checkbox
                      checked={selectedColors.includes(color.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedColors((prev) => [...prev, color.id]);
                        } else {
                          setSelectedColors((prev) =>
                            prev.filter((id) => id !== color.id)
                          );
                        }
                      }}
                    />
                  }
                  label={color.name}
                />
              ))}
            </FormGroup>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-3">Select Sizes</h4>
            <FormGroup>
              {sizes.map((size) => (
                <FormControlLabel
                  key={size.id}
                  control={
                    <Checkbox
                      checked={selectedSizes.includes(size.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSizes((prev) => [...prev, size.id]);
                        } else {
                          setSelectedSizes((prev) =>
                            prev.filter((id) => id !== size.id)
                          );
                        }
                      }}
                    />
                  }
                  label={size.name}
                />
              ))}
            </FormGroup>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              This will create{" "}
              <span className="font-bold">
                {selectedColors.length * selectedSizes.length}
              </span>{" "}
              new variants.
            </p>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleBulkAdd}
            sx={{ background: "var(--brand-secondary, #2563eb)" }}
          >
            Add Variants
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
