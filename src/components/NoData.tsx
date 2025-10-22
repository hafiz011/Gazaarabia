"use client";

import { PackageX } from "lucide-react"; // nice icon
import React from "react";

export default function NoData({
  message = "No products found in this category.",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center pt-5 pb-20 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <PackageX size={48} className="text-gray-500" />
      </div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">No Data Found</h2>
      <p className="text-gray-500 max-w-sm">{message}</p>
    </div>
  );
}
