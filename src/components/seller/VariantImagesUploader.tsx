"use client";

import { useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { uploadService } from "@/lib/services/uploadService";

interface VariantImage {
  url: string;
  alt?: string;
}

interface VariantImagesUploaderProps {
  images: VariantImage[];
  onImagesChange: (images: VariantImage[]) => void;
  onError: (message: string) => void;
  variantLabel?: string;
}

export const VariantImagesUploader = ({
  images,
  onImagesChange,
  onError,
  variantLabel = "Variant",
}: VariantImagesUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;

    try {
      setIsUploading(true);
      const fileArray = Array.from(files);
      const urls = await uploadService.uploadMultiple(fileArray, "variants");
      onImagesChange([
        ...images,
        ...urls.map((url: string) => ({ url, alt: "" })),
      ]);
    } catch (error) {
      onError("Variant image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };

  const handleRemove = (idx: number) => {
    onImagesChange(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Variant Images <span className="text-red-500">*</span> ({images.length})
      </label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
      >
        <Upload className="mx-auto mb-2 text-gray-400" size={24} />
        <p className="text-sm text-gray-600">
          Drag images or click to upload
        </p>
        {isUploading && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
            <span className="text-xs text-gray-600">Uploading...</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />

      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="group relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                <img
                  src={img.url}
                  alt={img.alt || `Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {idx === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                    1st
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
