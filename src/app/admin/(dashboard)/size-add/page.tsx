"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sizeService } from "@/lib/services/sizeService";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { PopUpInterface, AlertInterface } from "@/lib/types";
import { useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes";

export default function AddOrEditSizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");
  const sizeId = idParam ? Number(idParam) : null;

  const { data: session, status } = useSession();

  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

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
    name: "Size Name",
    description: "Description (optional)",
  };
  const PLACEHOLDERS = {
    name: "e.g. S, M, L, XL",
    description: "e.g. Small size, fits chest 36-38 inches",
  };

  // 🟡 Redirect if not logged in
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace(ROUTES.ADMIN.LOGIN);
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.replace(ROUTES.HOME);
    }
  }, [status, session, router]);

  // 🟡 Prefill if editing
  useEffect(() => {
    if (sizeId && session?.user?.token) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res: any = await sizeService.getById(session.user.token, sizeId);
          const data = res?.data ?? res;
          setForm({ name: data.name, description: data.description || "" });
        } catch (err: any) {
          setAlertMessageData({
            isOpen: true,
            type: "error",
            message: err?.message ?? "Failed to load size details.",
          });
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [sizeId, session?.user?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setPopUpAlertData({
        isOpen: true,
        type: "warning",
        message: "Please fill in the required fields before submitting.",
        onConfirm: () => setPopUpAlertData((prev) => ({ ...prev, isOpen: false })),
      });
      return;
    }

    try {
      setLoading(true);
      setAlertMessageData({ isOpen: false, type: "", message: "" });

      const token = session?.user?.token as string;

      if (sizeId) {
        await sizeService.update(token, sizeId, form);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Size updated successfully!",
        });
      } else {
        await sizeService.create(token, form);
        setAlertMessageData({
          isOpen: true,
          type: "success",
          message: "Size added successfully!",
        });
      }

      setTimeout(() => {
        router.push("/admin/sizes");
      }, 1000);
    } catch (err: any) {
      setAlertMessageData({
        isOpen: true,
        type: "error",
        message: err.message || "Failed to save size.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-[var(--white)] p-6 rounded-lg shadow-md border border-[var(--soft-gray)]">
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
        {sizeId ? "Edit Size" : "Add Size"}
      </h1>
      <p className="text-[var(--text-muted)] mb-6">
        {sizeId ? "Update this size information." : "Add and manage available sizes for your products."}
      </p>

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
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-secondary)]">
            {LABELS.name}
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`${loading ? "opacity-70 cursor-not-allowed" : ""} bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] text-white font-medium px-6 py-2 rounded-md shadow transition`}
          >
            {loading
              ? sizeId
                ? "Updating..."
                : "Adding..."
              : sizeId
                ? "Update Size"
                : "Add Size"}
          </button>
        </div>
      </form>

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
