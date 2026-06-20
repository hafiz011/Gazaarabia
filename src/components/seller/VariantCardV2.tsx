"use client";

import { Trash2, Copy, ChevronDown, ChevronUp, AlertCircle, Copy2 } from "lucide-react";
import { MenuItem, TextField, Tooltip, IconButton, Chip, Box } from "@mui/material";
import { useState } from "react";
import { VariantImagesUploader } from "./VariantImagesUploader";
import { VariantVideoUploader } from "./VariantVideoUploader";
import { ProductVariant } from "@/hooks/useVariantManagement";

interface VariantCardV2Props {
  variant: ProductVariant;
  index: number;
  colors: any[];
  sizes: any[];
  isDuplicate?: boolean;
  onVariantChange: (field: keyof ProductVariant, value: any) => void;
  onVariantRemove: () => void;
  onVariantCopy: () => void;
  onCopyToAllSizes?: () => void;
  onCopyToAllColors?: () => void;
  onError: (message: string) => void;
  autoFillPrice?: string | number;
}

export const VariantCardV2 = ({
  variant,
  index,
  colors,
  sizes,
  isDuplicate = false,
  onVariantChange,
  onVariantRemove,
  onVariantCopy,
  onCopyToAllSizes,
  onCopyToAllColors,
  onError,
  autoFillPrice,
}: VariantCardV2Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const colorName = colors.find((c) => String(c.id) === String(variant.colorId))?.name;
  const sizeName = sizes.find((s) => String(s.id) === String(variant.sizeId))?.name;

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-secondary, #3C61DD)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--brand-secondary, #3C61DD)",
    },
  };

  const handleImagesChange = (images: any[]) => {
    onVariantChange("images", images);
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow ${
        isDuplicate ? "border-red-300 bg-red-50" : "border-gray-300"
      }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-transparent px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3 flex-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 rounded transition"
          >
            {isExpanded ? (
              <ChevronUp size={18} className="text-gray-600" />
            ) : (
              <ChevronDown size={18} className="text-gray-600" />
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-800 text-sm">
                Variant #{index + 1}
              </h3>
              {colorName && (
                <Chip
                  label={colorName}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
              {sizeName && (
                <Chip
                  label={sizeName}
                  size="small"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
            </div>
            {isDuplicate && (
              <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                <AlertCircle size={14} />
                <span>Duplicate color-size combination</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
          {onCopyToAllSizes && (
            <Tooltip title="Copy to all sizes with this color">
              <IconButton
                size="small"
                onClick={onCopyToAllSizes}
                sx={{ color: "blue" }}
              >
                <Copy2 size={16} />
              </IconButton>
            </Tooltip>
          )}
          {onCopyToAllColors && (
            <Tooltip title="Copy to all colors with this size">
              <IconButton
                size="small"
                onClick={onCopyToAllColors}
                sx={{ color: "blue" }}
              >
                <Copy2 size={16} />
              </IconButton>
            </Tooltip>
          )}
          <button
            type="button"
            onClick={onVariantCopy}
            className="p-2 rounded-md border border-gray-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition flex items-center gap-1"
            title="Copy variant"
          >
            <Copy size={16} />
          </button>
          <button
            type="button"
            onClick={onVariantRemove}
            className="p-2 rounded-md border border-gray-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition flex items-center gap-1"
            title="Remove variant"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 py-4 space-y-6">
          {/* Color × Size × SKU × Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TextField
              select
              label="Color *"
              value={variant.colorId}
              onChange={(e) => onVariantChange("colorId", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
              error={isDuplicate}
            >
              <MenuItem value="">Select Color</MenuItem>
              {[...colors]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
            </TextField>

            <TextField
              select
              label="Size *"
              value={variant.sizeId}
              onChange={(e) => onVariantChange("sizeId", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
              error={isDuplicate}
            >
              <MenuItem value="">Select Size</MenuItem>
              {sizes.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="SKU (Optional)"
              value={variant.sku}
              onChange={(e) => onVariantChange("sku", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
              placeholder="e.g., SKU-M-RED"
            />

            <TextField
              label="Price *"
              type="number"
              value={variant.price}
              onChange={(e) => onVariantChange("price", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
              inputProps={{ step: "0.01", min: "0" }}
              helperText={
                autoFillPrice ? `Suggested: £${autoFillPrice}` : ""
              }
            />
          </div>

          {/* Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Stock Quantity *"
              type="number"
              value={variant.stock}
              onChange={(e) => onVariantChange("stock", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
              inputProps={{ min: "0" }}
            />
            <TextField
              label="Status"
              select
              value={variant.isActive ? "active" : "inactive"}
              onChange={(e) =>
                onVariantChange("isActive", e.target.value === "active")
              }
              fullWidth
              size="small"
              sx={fieldStyle}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Images */}
          <Box>
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-semibold text-gray-700 text-sm">
                Variant Images ({variant.images?.length || 0})
              </h4>
              <span className="text-xs text-gray-500">
                Upload color-specific images for this {colorName} {sizeName} variant
              </span>
            </div>
            <VariantImagesUploader
              images={variant.images || []}
              onImagesChange={handleImagesChange}
              onError={onError}
              variantLabel={`${colorName || "Color"} - ${sizeName || "Size"}`}
            />
          </Box>

          {/* Video */}
          <VariantVideoUploader
            videoUrl={variant.videoUrl || ""}
            videoThumbnail={variant.videoThumbnail}
            onVideoChange={(url) => onVariantChange("videoUrl", url)}
            onVideoThumbnailChange={(thumb) =>
              onVariantChange("videoThumbnail", thumb)
            }
            onError={onError}
            variantLabel={`${colorName || "Color"} - ${sizeName || "Size"}`}
          />
        </div>
      )}
    </div>
  );
};
