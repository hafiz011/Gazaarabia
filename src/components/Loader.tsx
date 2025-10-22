"use client";

import React from "react";
import { Loader2 } from "lucide-react"; // a nice spinner icon

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-black" size={36} />
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  );
}
