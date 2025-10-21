"use client";

import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;  // ✅ make sure this line exists
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const getPaginationRange = () => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const range: (number | string)[] = [];
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    range.push(1);
    if (left > 2) range.push("...");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("...");
    range.push(totalPages);
    return range;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t border-gray-200 bg-gray-50">
      {/* Left */}
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition"
          >
            {[5, 10, 20, 50].map((num,index) => (
              <option key={index} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <span className="text-gray-500">
          {totalItems === 0
            ? "0 of 0"
            : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                currentPage * pageSize,
                totalItems
              )} of ${totalItems}`}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 text-sm rounded-full border transition ${
            currentPage === 1
              ? "text-gray-300 bg-gray-100 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          }`}
        >
          Previous
        </button>

        {getPaginationRange().map((page, idx) =>
          page === "..." ? (
            <span key={idx} className="px-2 text-gray-400 select-none">
              ...
            </span>
          ) : (
            <button
              key={idx}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                currentPage === page
                  ? "bg-[var(--brand-primary)] text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className={`px-3 py-1 text-sm rounded-full border transition ${
            currentPage === totalPages || totalPages === 0
              ? "text-gray-300 bg-gray-100 cursor-not-allowed"
              : "text-gray-700 border-gray-300 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
