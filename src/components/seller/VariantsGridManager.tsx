"use client";

import {
  Trash2,
  Copy,
  AlertCircle,
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
  Settings2,
  Image as ImageIcon,
} from "lucide-react";
import {
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button as MuiButton,
  Checkbox,
  Tooltip,
  CircularProgress,
  Box,
} from "@mui/material";
import { useState, useMemo } from "react";
import { VariantImagesUploader } from "./VariantImagesUploader";
import { ProductVariant } from "@/hooks/useVariantManagement";

interface VariantsGridManagerProps {
  variants: ProductVariant[];
  onVariantsChange: (variants: ProductVariant[]) => void;
  colors: any[];
  sizes: any[];
  basePrice?: string | number;
  onError?: (message: string) => void;
}

export const VariantsGridManager = ({
  variants,
  onVariantsChange,
  colors,
  sizes,
  basePrice,
  onError,
}: VariantsGridManagerProps) => {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [editingVariantIdx, setEditingVariantIdx] = useState<number | null>(null);
  const [templatePrice, setTemplatePrice] = useState(basePrice?.toString() || "");
  const [templateStock, setTemplateStock] = useState("");
  const [imageUploadIdx, setImageUploadIdx] = useState<number | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Group variants by color and size for grid view
  const gridData = useMemo(() => {
    const grid: Record<string, Record<string, ProductVariant | null>> = {};

    // Initialize grid
    colors.forEach((color) => {
      grid[String(color.id)] = {};
      sizes.forEach((size) => {
        grid[String(color.id)][String(size.id)] = null;
      });
    });

    // Place variants in grid
    variants.forEach((variant, idx) => {
      const colorKey = String(variant.colorId);
      const sizeKey = String(variant.sizeId);
      if (grid[colorKey]) {
        grid[colorKey][sizeKey] = { ...variant, _index: idx } as any;
      }
    });

    return grid;
  }, [variants, colors, sizes]);

  const handleSelectVariant = (index: number, selected: boolean) => {
    const newSelected = new Set(selectedIndices);
    if (selected) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedIndices(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedIndices(new Set(variants.map((_, i) => i)));
    } else {
      setSelectedIndices(new Set());
    }
  };

  const handleDeleteVariants = () => {
    const newVariants = variants.filter((_, i) => !selectedIndices.has(i));
    onVariantsChange(newVariants);
    setSelectedIndices(new Set());
  };

  const handleCopyVariant = (index: number) => {
    const variantToCopy = variants[index];
    const newVariant: ProductVariant = {
      ...variantToCopy,
      id: undefined,
      sku: "",
      images: variantToCopy.images?.map((img) => ({ ...img, id: undefined })) || [],
    };
    onVariantsChange([...variants, newVariant]);
  };

  const handleToggleActive = (index: number) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      isActive: !newVariants[index].isActive,
    };
    onVariantsChange(newVariants);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    onVariantsChange(newVariants);
  };

  const handleApplyTemplate = () => {
    if (!templatePrice && !templateStock) {
      onError?.("Please enter price or stock value");
      return;
    }

    const newVariants = variants.map((v, idx) => {
      if (selectedIndices.has(idx)) {
        return {
          ...v,
          ...(templatePrice && { price: templatePrice }),
          ...(templateStock && { stock: templateStock }),
        };
      }
      return v;
    });

    onVariantsChange(newVariants);
    setTemplatePrice("");
    setTemplateStock("");
    setSelectedIndices(new Set());
  };

  const handleImagesChange = (images: any[]) => {
    if (imageUploadIdx !== null) {
      handleUpdateVariant(imageUploadIdx, "images", images);
      setShowImageUpload(false);
      setImageUploadIdx(null);
    }
  };

  const getColorName = (colorId: string | number) => {
    return colors.find((c) => String(c.id) === String(colorId))?.name || colorId;
  };

  const getSizeName = (sizeId: string | number) => {
    return sizes.find((s) => String(s.id) === String(sizeId))?.name || sizeId;
  };

  const colorHex = (colorId: string | number) => {
    const color = colors.find((c) => String(c.id) === String(colorId));
    return color?.hexCode || color?.colorCode || "#ccc";
  };

  const completeness = (variant: ProductVariant) => {
    let score = 0;
    if (variant.colorId) score++;
    if (variant.sizeId) score++;
    if (variant.sku) score++;
    if (variant.price) score++;
    if (variant.stock !== undefined && variant.stock !== "") score++;
    if (variant.images?.length) score++;
    return (score / 6) * 100;
  };

  const selectedVariants = Array.from(selectedIndices).map((i) => variants[i]);

  return (
    <Box className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Product Variants</h2>
          <p className="text-sm text-gray-500 mt-1">
            {variants.length} variant{variants.length !== 1 ? "s" : ""} •{" "}
            {variants.filter((v) => v.isActive).length} active
          </p>
        </div>

        <div className="flex gap-2 items-center">
          {selectedVariants.length > 0 && (
            <div className="flex gap-2 items-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
              <Checkbox
                size="small"
                checked={selectedIndices.size === variants.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <span className="text-sm font-medium text-gray-700">
                {selectedIndices.size} selected
              </span>
              <div className="h-6 w-px bg-gray-300"></div>
              <Tooltip title="Apply price/stock to selected">
                <MuiButton
                  size="small"
                  variant="text"
                  onClick={() => {
                    // Show template dialog
                    const dialog = document.getElementById("template-dialog");
                    if (dialog) dialog.click();
                  }}
                >
                  <Settings2 size={16} className="mr-1" />
                  Template
                </MuiButton>
              </Tooltip>
              <Tooltip title="Delete selected">
                <MuiButton
                  size="small"
                  variant="text"
                  color="error"
                  onClick={handleDeleteVariants}
                >
                  <Trash2 size={16} />
                </MuiButton>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <AlertCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No variants yet</h3>
          <p className="text-gray-500">Use the quick add section to create your first variant</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            {/* Header */}
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    size="small"
                    checked={selectedIndices.size === variants.length && variants.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Color & Size</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">SKU</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Stock</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Images</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Progress</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="divide-y divide-gray-200">
              {variants.map((variant, idx) => {
                const color = colors.find((c) => String(c.id) === String(variant.colorId));
                const size = sizes.find((s) => String(s.id) === String(variant.sizeId));
                const isSelected = selectedIndices.has(idx);
                const progress = completeness(variant);

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-gray-50 transition ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={(e) => handleSelectVariant(idx, e.target.checked)}
                      />
                    </td>

                    {/* Color & Size */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Color Swatch */}
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                            style={{
                              backgroundColor: colorHex(variant.colorId),
                            }}
                            title={getColorName(variant.colorId)}
                          />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {getColorName(variant.colorId)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {getSizeName(variant.sizeId)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* SKU */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="SKU"
                      />
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-gray-500">£</span>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleUpdateVariant(idx, "price", e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-right"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3 text-right">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => handleUpdateVariant(idx, "stock", e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-right"
                        placeholder="0"
                        min="0"
                      />
                    </td>

                    {/* Images */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {variant.images?.length || 0}
                        </span>
                        <Tooltip title="Add/edit images">
                          <button
                            type="button"
                            onClick={() => {
                              setImageUploadIdx(idx);
                              setShowImageUpload(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-blue-50 border border-gray-300 text-blue-600 hover:border-blue-400 transition"
                          >
                            <ImageIcon size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <Tooltip
                        title={variant.isActive ? "Click to deactivate" : "Click to activate"}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleActive(idx)}
                          className="p-1.5 rounded-lg transition"
                        >
                          {variant.isActive ? (
                            <Eye className="text-green-600" size={18} />
                          ) : (
                            <EyeOff className="text-gray-400" size={18} />
                          )}
                        </button>
                      </Tooltip>
                    </td>

                    {/* Progress Circle */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center relative w-10 h-10 mx-auto">
                        <CircularProgress
                          variant="determinate"
                          value={progress}
                          size={40}
                          sx={{
                            color:
                              progress === 100
                                ? "#10b981"
                                : progress >= 66
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        />
                        <span
                          className="text-xs font-bold absolute"
                          style={{
                            color:
                              progress === 100
                                ? "#10b981"
                                : progress >= 66
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                        >
                          {Math.round(progress)}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip title="Duplicate">
                          <button
                            type="button"
                            onClick={() => handleCopyVariant(idx)}
                            className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition"
                          >
                            <Copy size={16} />
                          </button>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <button
                            type="button"
                            onClick={() => {
                              onVariantsChange(
                                variants.filter((_, i) => i !== idx)
                              );
                              setSelectedIndices(
                                new Set(
                                  Array.from(selectedIndices)
                                    .map((i) => (i > idx ? i - 1 : i))
                                    .filter((i) => i !== idx)
                                )
                              );
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Add Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-xl border border-blue-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload size={18} className="text-blue-600" />
          Quick Stats
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Total Variants</p>
            <p className="text-2xl font-bold text-gray-900">{variants.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {variants.filter((v) => v.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">With Images</p>
            <p className="text-2xl font-bold text-blue-600">
              {variants.filter((v) => v.images?.length).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Complete</p>
            <p className="text-2xl font-bold text-orange-600">
              {variants.filter((v) => completeness(v) === 100).length}
            </p>
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <Dialog
        open={showImageUpload}
        onClose={() => {
          setShowImageUpload(false);
          setImageUploadIdx(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upload Images - {imageUploadIdx !== null && `Variant #${imageUploadIdx + 1}`}
        </DialogTitle>
        <DialogContent className="pt-6">
          {imageUploadIdx !== null && (
            <VariantImagesUploader
              images={variants[imageUploadIdx]?.images || []}
              onImagesChange={handleImagesChange}
              onError={onError || (() => {})}
              variantLabel={`Variant #${imageUploadIdx + 1}`}
            />
          )}
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => {
              setShowImageUpload(false);
              setImageUploadIdx(null);
            }}
          >
            Done
          </MuiButton>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog
        id="template-dialog"
        open={selectedVariants.length > 0}
        onClose={() => {
          setTemplatePrice("");
          setTemplateStock("");
          setSelectedIndices(new Set());
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Apply Template to {selectedVariants.length} Variant(s)</DialogTitle>
        <DialogContent className="space-y-4 pt-6">
          <p className="text-sm text-gray-600">
            Fill in price and/or stock to apply to all selected variants.
          </p>
          <TextField
            label="Price"
            type="number"
            value={templatePrice}
            onChange={(e) => setTemplatePrice(e.target.value)}
            fullWidth
            size="small"
            placeholder="Leave empty to skip"
            InputProps={{ startAdornment: <span className="text-gray-500 mr-2">£</span> }}
            inputProps={{ step: "0.01" }}
          />
          <TextField
            label="Stock"
            type="number"
            value={templateStock}
            onChange={(e) => setTemplateStock(e.target.value)}
            fullWidth
            size="small"
            placeholder="Leave empty to skip"
            inputProps={{ min: "0" }}
          />
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={() => {
              setTemplatePrice("");
              setTemplateStock("");
              setSelectedIndices(new Set());
            }}
          >
            Cancel
          </MuiButton>
          <MuiButton variant="contained" onClick={handleApplyTemplate}>
            Apply
          </MuiButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
