"use client";

import { AlertCircle, X } from "lucide-react";

interface VariantWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VariantWarningModal({ isOpen, onClose }: VariantWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 relative text-center">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <AlertCircle className="mx-auto text-[var(--brand-primary)] mb-3" size={40} />
        <h2 className="text-lg font-semibold mb-2">Please select Size & Color</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose both options before adding the product to your cart.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[var(--brand-primary)] text-white py-2 rounded-lg hover:opacity-90"
        >
          OK
        </button>
      </div>
    </div>
  );
}
