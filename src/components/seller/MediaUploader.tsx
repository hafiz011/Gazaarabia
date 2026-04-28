"use client";

import { useState, useRef } from "react";
import { Upload, Trash2, GripVertical } from "lucide-react";
import { uploadService } from "@/lib/services/uploadService";

interface MediaImage {
  url: string;
  alt: string;
  colorId?: string;
  primary?: boolean;
}

interface MediaUploaderProps {
  images: MediaImage[];
  onImagesChange: (images: MediaImage[]) => void;
  onError: (message: string) => void;
  maxImages?: number;
}

export const MediaUploader = ({
  images,
  onImagesChange,
  onError,
  maxImages = 10,
}: MediaUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;
    if (images.length + files.length > maxImages) {
      onError(`Maximum ${maxImages} images allowed`);
      return;
    }

    try {
      setIsUploading(true);
      const fileArray = Array.from(files);
      const urls = await uploadService.uploadMultiple(fileArray, "products");
      onImagesChange([
        ...images,
        ...urls.map((url: string) => ({
          url,
          alt: "",
          colorId: "",
          primary: images.length === 0,
        })),
      ]);
    } catch (error) {
      onError("Image upload failed. Please try again.");
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
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        } ${isUploading ? "opacity-50" : ""}`}
      >
        <Upload className="mx-auto mb-2 text-gray-400" size={32} />
        <p className="font-medium text-gray-700">
          Drag images here or click to upload
        </p>
        <p className="text-sm text-gray-500 mt-1">
          PNG, JPG up to 10MB • Max {maxImages} images
        </p>
        {isUploading && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            <span className="text-sm text-gray-600">Uploading...</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative">
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                <img
                  src={img.url}
                  alt={img.alt || `Product ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {idx === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    Cover
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Delete image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {idx === 0 ? "Cover" : `Image ${idx + 1}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
