"use client";

import React from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface AlertMessageProps {
  type: "success" | "error";
  message: string;
  onClose?: () => void;
}

export default function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  //  use brand colors from :root
  const baseClass =
    type === "success"
      ? "bg-[var(--soft-gray)] border-[var(--brand-secondary)] text-[var(--brand-secondary)]"
      : "bg-[var(--soft-gray)] border-[var(--brand-primary)] text-[var(--brand-primary)]";

  const Icon = type === "success" ? CheckCircle : AlertCircle;

  return (
    <div
      className={`flex items-start gap-2 p-3 border rounded-md mb-4 ${baseClass} transition-all`}
      role={type === "success" ? "status" : "alert"}
    >
      <Icon size={20} className="mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-sm text-[var(--dark-gray)] hover:text-[var(--text-primary)] transition"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
