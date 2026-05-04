"use client";

import React from "react";

export default function SellerLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full space-y-6 animate-fadeIn">
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full" />
        
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 border-4 border-t-[var(--brand-primary)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
        
        {/* Pulsing center icon-like shape */}
        <div className="absolute inset-4 bg-gradient-to-tr from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-2xl opacity-20 animate-pulse" />
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">
          Gaza<span className="text-[var(--brand-primary)]">Arabia</span>
        </h3>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 bg-[var(--brand-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1 h-1 bg-[var(--brand-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1 h-1 bg-[var(--brand-primary)] rounded-full animate-bounce" />
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-4">
          Synchronizing Dashboard
        </p>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 bg-[var(--brand-primary)]/5 blur-[100px] rounded-full animate-pulse" />
    </div>
  );
}
