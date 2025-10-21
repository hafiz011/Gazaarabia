"use client";

import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

interface PopupAlertProps {
  type?: "success" | "error" | "warning";
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  show: boolean;
}

export default function PopupAlert({
  type = "success",
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  show,
}: PopupAlertProps) {
  if (!show) return null;

  const colorClass =
    type === "success"
      ? "text-[var(--brand-secondary)]"
      : type === "error"
      ? "text-[var(--brand-primary)]"
      : "text-[var(--navy-blue)]";

  const Icon =
    type === "success" ? CheckCircle : type === "error" ? AlertCircle : XCircle;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <div className="flex items-center gap-2 mb-4">
          <Icon size={28} className={colorClass} />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            {title || (type === "success" ? "Success" : type === "error" ? "Error" : "Alert")}
          </h2>
        </div>

        <p className="text-[var(--text-secondary)] mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-[var(--soft-gray)] text-[var(--text-secondary)] hover:bg-[var(--soft-gray)] transition"
            >
              {cancelText}
            </button>
          )}
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white ${
                type === "error"
                  ? "bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)]"
                  : "bg-[var(--brand-secondary)] hover:bg-[var(--brand-primary)]"
              } transition`}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
