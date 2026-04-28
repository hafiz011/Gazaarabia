"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, PlayCircle } from "lucide-react";
import { uploadService } from "@/lib/services/uploadService";

interface VariantVideoUploaderProps {
  videoUrl: string;
  videoThumbnail?: string;
  onVideoChange: (url: string) => void;
  onVideoThumbnailChange?: (thumbnail: string) => void;
  onError: (message: string) => void;
  variantLabel?: string;
}

export const VariantVideoUploader = ({
  videoUrl,
  videoThumbnail,
  onVideoChange,
  onVideoThumbnailChange,
  onError,
  variantLabel = "Variant",
}: VariantVideoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB

  const handleFileChange = async (files: FileList | null) => {
    if (!files) return;
    const file = files[0];
    if (!file) return;

    if (file.size > MAX_VIDEO_SIZE) {
      onError("Video must be under 15MB");
      return;
    }

    try {
      setIsUploading(true);
      const url = await uploadService.uploadVideo(file, "variant-videos");
      onVideoChange(url);
    } catch (error) {
      onError("Video upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onVideoChange("");
    if (onVideoThumbnailChange) onVideoThumbnailChange("");
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        Variant Video <span className="text-gray-500 font-normal">(Optional)</span>
      </label>

      {videoUrl ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 w-full max-w-xs group">
          <video
            src={videoUrl}
            poster={videoThumbnail}
            className="w-full aspect-video object-cover"
            controls
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition shadow-lg"
            title="Delete video"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
        >
          <PlayCircle className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-sm text-gray-600">
            Click to upload video (MP4, WebM)
          </p>
          <p className="text-xs text-gray-500 mt-1">Max 15MB</p>
          {isUploading && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">Uploading video...</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm"
        onChange={(e) => handleFileChange(e.target.files)}
        className="hidden"
      />
    </div>
  );
};
