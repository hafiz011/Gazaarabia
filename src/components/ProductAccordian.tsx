"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function AccordionSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex justify-between items-center w-full py-4 text-left text-sm font-semibold tracking-wide uppercase"
      >
        <span className="text-[var(--text-primary)]">{title}</span>
        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
          size={20}
        />
      </button>

      {open && (
        <div className="pb-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
}
