"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { materialCareService } from "@/lib/services/materialCareService";
import { Upload } from "lucide-react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import RichTextEditor from "@/components/RichTextEditor";

export default function MaterialCareFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id?.[0];
  const isEditMode = Boolean(id);

  const { data: session } = useSession();
  const token = session?.user?.token;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    careType: "",
    material: "",
    icon: "",
  });

  const [preview, setPreview] = useState<string>("");
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  const [alertMessageData, setAlertMessageData] = useState<AlertInterface>({
    isOpen: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    if (isEditMode && token) fetchMaterialCare();
  }, [id, token]);

  const fetchMaterialCare = async () => {
    try {
      setFetching(true);
      const data = await materialCareService.getById(token!, Number(id));
      setFormData({
        title: data.title || "",
        description: data.description || "",
        careType: data.careType || "",
        material: data.material || "",
        icon: data.icon || "",
      });
      setPreview(data.icon || "");
    } catch {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: "Failed to load material care details.",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);

    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload?folder=material-care", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Failed to upload image");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, icon: data.url }));
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Image upload failed.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !token) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Title and description are required.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode) {
        await materialCareService.update(token, Number(id), formData);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Material care updated successfully!",
        });
      } else {
        await materialCareService.create(token, formData);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Material care added successfully!",
        });
      }

      setTimeout(() => router.push("/admin/material-cares"), 1000);
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save material care.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-6">
          {isEditMode ? "Edit Material Care" : "Add Material Care"}
        </h1>

        {(alertMessageData.isOpen && alertMessageData.type) && (
          <AlertMessage
            type={alertMessageData.type}
            message={alertMessageData.message}
            onClose={() => setAlertMessageData((prev) => ({ ...prev, isOpen: false }))}
          />
        )}

        {fetching && isEditMode && !formData.title ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-[var(--brand-secondary)]"
              placeholder="e.g. Cotton Care"
            />

            {/* Care Type + Material */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Care Type
                </label>
                <input
                  name="careType"
                  value={formData.careType}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. Wash, Dry, Iron..."
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Material
                </label>
                <input
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g. 100% Cotton"
                />
              </div>
            </div>

            {/* Icon Upload */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Icon (optional)
            </label>
            <div
              onClick={handleUploadClick}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand-primary)] transition mb-4"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Icon Preview"
                  className="h-16 w-16 object-contain mb-2"
                />
              ) : (
                <Upload className="text-gray-400 mb-2" size={28} />
              )}
              <p className="text-sm text-gray-500">
                Click to upload or drop an image here
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Description */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
              minHeight={200}
              placeholder="e.g. Machine wash at 30°C. Do not bleach. Tumble dry low."
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/material-cares")}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] transition flex items-center gap-2"
              >
                {submitting && (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                {submitting
                  ? isEditMode
                    ? "Updating..."
                    : "Saving..."
                  : isEditMode
                    ? "Update"
                    : "Add"}
              </button>
            </div>
          </form>
        )}

        <PopupAlert
          type={popUpAlertData.type as any}
          message={popUpAlertData.message}
          confirmText={popUpAlertData.type === "confirm" ? "Yes" : "OK"}
          cancelText={popUpAlertData.type === "confirm" ? "Cancel" : undefined}
          onConfirm={popUpAlertData.onConfirm}
          onCancel={popUpAlertData.onCancel}
          show={popUpAlertData.isOpen}
        />
      </div>
    </div>
  );
}
