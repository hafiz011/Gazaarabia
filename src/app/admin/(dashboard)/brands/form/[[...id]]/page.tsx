"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { brandService } from "@/lib/services/brandService";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function BrandFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id?.[0];
  const isEditMode = Boolean(id);

  const { data: session, status } = useSession();
  const token = session?.user?.token;
  const alowedRoles = ["admin"];


  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    isTrending: false,
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


  //  Redirect unauthorized users
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && !alowedRoles.includes(session?.user?.role)) {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);


  useEffect(() => {
    if (isEditMode && token) fetchBrandData();
  }, [id, token]);

  const fetchBrandData = async () => {
    try {
      setFetching(true);
      const res = await brandService.getById(token!, Number(id));
      const data = res?.data ?? res;
      setFormData({
        name: data.name || "",
        logo: data.logo || "",
        isTrending: Boolean(data.isTrending),
      });
      if (data.logo) setPreview(data.logo);
    } catch (error: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: error.message || "Failed to load brand details.",
      });
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

      const res = await fetch("/api/upload?folder=brands", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Failed to upload logo");
      const data = await res.json();
      setFormData((prev) => ({ ...prev, logo: data.url }));
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Logo upload failed.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Brand name is required.",
        onConfirm: () =>
          setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setSubmitting(true);
      setAlertMessageData({ isOpen: false, type: "", message: "" });

      if (isEditMode) {
        await brandService.update(token!, Number(id), formData);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Brand updated successfully!",
        });
      } else {
        await brandService.create(token!, formData);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Brand added successfully!",
        });
      }

      setTimeout(() => router.push("/admin/brands"), 1000);
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save brand.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow border border-gray-200 p-8">
        <h1 className="text-2xl font-semibold mb-6">
          {isEditMode ? "Edit Brand" : "Add Brand"}
        </h1>

        {alertMessageData.isOpen && alertMessageData.type && (
          <AlertMessage
            type={alertMessageData.type}
            message={alertMessageData.message}
            onClose={() =>
              setAlertMessageData((prev) => ({ ...prev, isOpen: false }))
            }
          />
        )}

        {fetching && isEditMode && !formData.name ? (
          <p>Loading...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Brand Name */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 mb-5"
              placeholder="e.g. Nike"
              required
            />

            {/* Logo Upload */}
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Brand Logo (optional)
            </label>
            <div
              onClick={handleUploadClick}
              className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand-primary)] transition mb-4"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Logo Preview"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <>
                  <Upload className="text-gray-400 mb-2" size={28} />
                  <p className="text-sm text-gray-500 text-center">
                    Click to upload
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Trending Checkbox */}
            <div className="mb-6 flex items-center gap-2">
              <input
                type="checkbox"
                id="isTrending"
                name="isTrending"
                checked={formData.isTrending}
                onChange={handleChange}
              />
              <label htmlFor="isTrending" className="text-sm text-gray-700">
                Mark as Trending
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.push("/admin/brands")}
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
