"use client";

import { Trash2, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { MenuItem, TextField } from "@mui/material";
import { useState } from "react";
import { VariantImagesUploader } from "./VariantImagesUploader";
import { VariantVideoUploader } from "./VariantVideoUploader";

interface Variant {
  colorId: string | number;
  sizeId: string | number;
  sku: string;
  price: string | number;
  stock: string | number;
  isActive?: boolean;
  images?: any[];
  videoUrl?: string;
  videoThumbnail?: string;
  [key: string]: any;
}

interface VariantCardProps {
  variant: Variant;
  index: number;
  colors: any[];
  sizes: any[];
  onVariantChange: (field: string, value: any) => void;
  onVariantRemove: () => void;
  onVariantCopy: () => void;
  onError: (message: string) => void;
  autoFillPrice?: string;
}

export const VariantCard = ({
  variant,
  index,
  colors,
  sizes,
  onVariantChange,
  onVariantRemove,
  onVariantCopy,
  onError,
  autoFillPrice,
}: VariantCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleImagesChange = (images: any[]) => {
    onVariantChange("images", images);
  };

  const fieldStyle = {
    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
      borderColor: "var(--brand-secondary, #3C61DD)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "var(--brand-secondary, #3C61DD)",
    },
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
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
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Variant #{index + 1}
            </h3>
            <p className="text-xs text-gray-500">
              {variant.colorId && colors.find((c) => c.id == variant.colorId)?.name}{" "}
              {variant.sizeId && " / " + sizes.find((s) => s.id == variant.sizeId)?.name}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5">
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
          {/* Color × Size × SKU */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TextField
              select
              label="Color *"
              value={variant.colorId}
              onChange={(e) => onVariantChange("colorId", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
            >
              <MenuItem value="">Select Color</MenuItem>
              {[...colors].sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
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
            >
              <MenuItem value="">Select Size</MenuItem>
              {sizes.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="SKU"
              value={variant.sku}
              onChange={(e) => onVariantChange("sku", e.target.value)}
              fullWidth
              size="small"
              sx={fieldStyle}
              placeholder="e.g., SKU-001"
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
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Images */}
          <VariantImagesUploader
            images={variant.images || []}
            onImagesChange={handleImagesChange}
            onError={onError}
            variantLabel={`Variant #${index + 1}`}
          />

          {/* Video */}
          <VariantVideoUploader
            videoUrl={variant.videoUrl || ""}
            videoThumbnail={variant.videoThumbnail}
            onVideoChange={(url) => onVariantChange("videoUrl", url)}
            onVideoThumbnailChange={(thumb) =>
              onVariantChange("videoThumbnail", thumb)
            }
            onError={onError}
            variantLabel={`Variant #${index + 1}`}
          />
        </div>
      )}
    </div>
  );
};
