"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    totalPages,
    currentPage,
    onPageChange,
}: PaginationProps) {
    return (
        <div className="flex justify-center mt-10 gap-2">
            {/* Prev Button */}
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition
          ${currentPage === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:bg-black hover:text-white"
                    }`}
            >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: totalPages }).map((_, index) => {
                const page = index + 1;
                // Show first, last, and current +/- 2
                if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-10 h-10 flex items-center justify-center border rounded-full text-sm font-medium transition
                  ${currentPage === page
                                    ? "bg-black text-white border-black"
                                    : "border-gray-300 hover:bg-black hover:text-white"
                                }`}
                        >
                            {page}
                        </button>
                    );
                }

                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                        <span key={page} className="flex items-center justify-center w-8 text-gray-400">
                            ...
                        </span>
                    );
                }

                return null;
            })}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium transition
          ${currentPage === totalPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 hover:bg-black hover:text-white"
                    }`}
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
}
