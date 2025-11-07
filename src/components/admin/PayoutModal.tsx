"use client";

import { X } from "lucide-react";

export default function PayoutModal({
  show,
  title,
  children,
  onClose,
  onSubmit,
  submitText = "Submit",
  submitting = false,
}: {
  show: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  submitText?: string;
  submitting?: boolean;
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-slide-up relative">

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        {/* Content */}
        <div className="space-y-3">{children}</div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className={`px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] transition flex items-center gap-2 text-sm ${submitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
          >
            {submitting && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            {submitting ? "Processing..." : submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
