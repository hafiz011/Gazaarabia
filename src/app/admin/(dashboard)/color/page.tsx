"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { colorService } from "@/lib/services/colorService";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface, AlertInterface } from "@/lib/types";

// 🧮 Convert hex to RGB string
const hexToRgb = (hex: string) => {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
};

export default function AddColorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const colorIdParam = searchParams.get("id");
  const colorId = colorIdParam ? Number(colorIdParam) : null;

  const [form, setForm] = useState({
    name: "",
    hexCode: "#000000",
    rgbCode: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // ✅ Popup & Alert states
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

  const LABELS = {
    name: "Color Name",
    hexCode: "Pick Color",
    rgbCode: "RGB Code (auto)",
    description: "Description (optional)",
  };

  const PLACEHOLDERS = {
    name: "e.g. Red, Sky Blue",
    rgbCode: "e.g. 255, 0, 0",
    description: "e.g. Bright red shade for T-shirts",
  };

  // 🟡 Prefill form if editing
  useEffect(() => {
    if (colorId) {
      const fetchColor = async () => {
        try {
          setLoading(true);
          const data = await colorService.getById(colorId);
          setForm({
            name: data.name,
            hexCode: data.hexCode,
            rgbCode: data.rgbCode || "",
            description: data.description || "",
          });
        } catch (err) {
          setAlertMessageData({
            isOpen: true,
            type: "error",
            message: "Failed to load color details.",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchColor();
    }
  }, [colorId]);

  // 🖊 Update form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "hexCode" && { rgbCode: hexToRgb(value) }), // auto convert RGB
    }));
  };

  // 📝 Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.hexCode) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Color name and HEX code are required.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setLoading(true);
      setAlertMessageData({ isOpen: false, type: "", message: "" });

      if (colorId) {
        await colorService.update(colorId, form);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Color updated successfully!",
        });
      } else {
        await colorService.create(form);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Color added successfully!",
        });
      }

      setTimeout(() => {
        router.push("/admin/colors-list");
      }, 1000);
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save color.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[var(--white)] p-6 rounded-lg shadow-md border border-[var(--soft-gray)]">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
        {colorId ? "Edit Color" : "Add Color"}
      </h1>
      <p className="text-[var(--text-muted)] mb-6">
        {colorId
          ? "Update this color information."
          : "Add and manage available colors for your products."}
      </p>

      {/* ✅ Alert Messages */}
      {alertMessageData.isOpen && alertMessageData.type && (
        <AlertMessage
          type={alertMessageData.type}
          message={alertMessageData.message}
          onClose={() =>
            setAlertMessageData((prev) => ({ ...prev, isOpen: false }))
          }
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-secondary)]">
            {LABELS.name} <span className="text-[var(--brand-primary)]">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={PLACEHOLDERS.name}
            className="w-full border border-[var(--soft-gray)] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
          />
        </div>

        {/* Hex Code */}
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-secondary)]">
            {LABELS.hexCode} <span className="text-[var(--brand-primary)]">*</span>
          </label>
          <input
            type="color"
            name="hexCode"
            required
            value={form.hexCode}
            onChange={handleChange}
            className="w-20 h-10 p-0 border-none cursor-pointer"
          />
        </div>

        {/* RGB Code */}
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-secondary)]">
            {LABELS.rgbCode}
          </label>
          <input
            type="text"
            name="rgbCode"
            value={form.rgbCode}
            readOnly
            placeholder={PLACEHOLDERS.rgbCode}
            className="w-full border border-[var(--soft-gray)] rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-secondary)]">
            {LABELS.description}
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={PLACEHOLDERS.description}
            className="w-full border border-[var(--soft-gray)] rounded-md px-3 py-2 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`${
              loading ? "opacity-70 cursor-not-allowed" : ""
            } bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white font-medium px-6 py-2 rounded-md shadow transition`}
          >
            {loading
              ? colorId
                ? "Updating..."
                : "Adding..."
              : colorId
              ? "Update Color"
              : "Add Color"}
          </button>
        </div>
      </form>

      {/* 🆕 Popup Alert */}
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
  );
}
