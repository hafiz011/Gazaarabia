"use client";

import {
  Plus,
  X,
  Check,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Button as MuiButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { useState } from "react";
import { ProductVariant } from "@/hooks/useVariantManagement";

interface VariantsQuickAddProps {
  onVariantsAdd: (variants: ProductVariant[]) => void;
  colors: any[];
  sizes: any[];
  basePrice?: string | number;
  existingVariants?: ProductVariant[];
  onError?: (message: string) => void;
}

export const VariantsQuickAdd = ({
  onVariantsAdd,
  colors,
  sizes,
  basePrice,
  existingVariants = [],
  onError,
}: VariantsQuickAddProps) => {
  const [open, setOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<Set<string | number>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string | number>>(new Set());

  // Check which combinations already exist
  const existingCombos = new Set(
    existingVariants.map((v) => `${v.colorId}-${v.sizeId}`)
  );

  const toggleColor = (colorId: string | number) => {
    const newSelected = new Set(selectedColors);
    if (newSelected.has(colorId)) {
      newSelected.delete(colorId);
    } else {
      newSelected.add(colorId);
    }
    setSelectedColors(newSelected);
  };

  const toggleSize = (sizeId: string | number) => {
    const newSelected = new Set(selectedSizes);
    if (newSelected.has(sizeId)) {
      newSelected.delete(sizeId);
    } else {
      newSelected.add(sizeId);
    }
    setSelectedSizes(newSelected);
  };

  const handleSelectAll = (type: "colors" | "sizes", select: boolean) => {
    if (type === "colors") {
      if (select) {
        setSelectedColors(new Set(colors.map((c) => c.id)));
      } else {
        setSelectedColors(new Set());
      }
    } else {
      if (select) {
        setSelectedSizes(new Set(sizes.map((s) => s.id)));
      } else {
        setSelectedSizes(new Set());
      }
    }
  };

  const handleCreate = () => {
    if (selectedColors.size === 0 || selectedSizes.size === 0) {
      onError?.("Please select at least one color and one size");
      return;
    }

    const newVariants: ProductVariant[] = [];
    let duplicateCount = 0;

    for (const colorId of selectedColors) {
      for (const sizeId of selectedSizes) {
        const key = `${colorId}-${sizeId}`;
        if (existingCombos.has(key)) {
          duplicateCount++;
          continue;
        }

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

    if (newVariants.length === 0 && duplicateCount > 0) {
      onError?.(`All ${duplicateCount} combinations already exist`);
      return;
    }

    if (newVariants.length > 0) {
      onVariantsAdd(newVariants);
      setSelectedColors(new Set());
      setSelectedSizes(new Set());
      setOpen(false);
    }

    if (duplicateCount > 0) {
      onError?.(`Skipped ${duplicateCount} existing combination(s)`);
    }
  };

  const totalNew = selectedColors.size * selectedSizes.size;
  const existingCount = Array.from(selectedColors).reduce((acc, colorId) => {
    return (
      acc +
      Array.from(selectedSizes).reduce((sAcc, sizeId) => {
        return existingCombos.has(`${colorId}-${sizeId}`) ? sAcc + 1 : sAcc;
      }, 0)
    );
  }, 0);

  const colorHex = (colorId: string | number) => {
    const color = colors.find((c) => String(c.id) === String(colorId));
    return color?.hexCode || color?.colorCode || "#ccc";
  };

  return (
    <>
      {/* Quick Add Button */}
      <Tooltip title="Add multiple variants at once">
        <MuiButton
          variant="contained"
          onClick={() => setOpen(true)}
          startIcon={<Plus size={20} />}
          sx={{
            background: "var(--brand-secondary, #2563eb)",
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            py: 1.5,
            px: 3,
          }}
        >
          <span className="hidden sm:inline">Quick Add</span>
        </MuiButton>
      </Tooltip>

      {/* Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="flex items-center gap-2">
          <Zap className="text-blue-600" size={20} />
          Quick Add Variants
        </DialogTitle>

        <DialogContent className="space-y-6 py-6">
          {/* Colors Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Select Colors</h3>
              <button
                type="button"
                onClick={() =>
                  handleSelectAll(
                    "colors",
                    selectedColors.size !== colors.length
                  )
                }
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {selectedColors.size === colors.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {colors.map((color) => {
                const isSelected = selectedColors.has(color.id);
                return (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className={`group relative rounded-lg overflow-hidden transition p-3 border-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm flex-shrink-0"
                        style={{ backgroundColor: colorHex(color.id) }}
                      />
                      <span className="text-sm font-medium text-gray-900 text-left flex-1">
                        {color.name}
                      </span>
                      {isSelected && (
                        <Check size={16} className="text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes Selection */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Select Sizes</h3>
              <button
                type="button"
                onClick={() =>
                  handleSelectAll(
                    "sizes",
                    selectedSizes.size !== sizes.length
                  )
                }
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                {selectedSizes.size === sizes.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSizes.has(size.id);
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => toggleSize(size.id)}
                    className={`relative rounded-lg transition p-3 border-2 font-semibold text-sm ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 hover:border-gray-300 text-gray-900"
                    }`}
                  >
                    {size.name}
                    {isSelected && (
                      <Check size={14} className="text-blue-600 absolute top-1 right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Preview */}
          {selectedColors.size > 0 && selectedSizes.size > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 space-y-3">
              <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
                <Zap size={16} className="text-blue-600" />
                Preview: {totalNew - existingCount} new variants
              </h4>

              {existingCount > 0 && (
                <p className="text-xs text-orange-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {existingCount} combination(s) already exist
                </p>
              )}

              <div className="text-sm text-gray-600">
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {Array.from(selectedColors).map((colorId) =>
                    Array.from(selectedSizes).map((sizeId) => {
                      const exists = existingCombos.has(`${colorId}-${sizeId}`);
                      const colorName = colors.find((c) => c.id === colorId)?.name;
                      const sizeName = sizes.find((s) => s.id === sizeId)?.name;

                      return (
                        <div
                          key={`${colorId}-${sizeId}`}
                          className={`flex items-center gap-2 px-3 py-2 rounded text-xs ${
                            exists
                              ? "bg-gray-100 text-gray-500 line-through"
                              : "bg-white border border-blue-200 text-gray-900"
                          }`}
                        >
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: colorHex(colorId) }}
                          />
                          {colorName} - {sizeName}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {selectedColors.size === 0 && selectedSizes.size === 0 && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <AlertCircle className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-sm text-gray-500">
                Select at least one color and one size to create variants
              </p>
            </div>
          )}
        </DialogContent>

        <DialogActions className="p-4 border-t border-gray-200">
          <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
          <MuiButton
            variant="contained"
            onClick={handleCreate}
            disabled={selectedColors.size === 0 || selectedSizes.size === 0}
            sx={{
              background: "var(--brand-secondary, #2563eb)",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            <Plus size={16} className="mr-1" />
            Create {totalNew - existingCount} Variant{totalNew - existingCount !== 1 ? "s" : ""}
          </MuiButton>
        </DialogActions>
      </Dialog>
    </>
  );
};
