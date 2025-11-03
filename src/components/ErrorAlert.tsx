"use client";

import React from "react";
import { AlertCircle } from "lucide-react";

interface AlertBoxProps {
  message: string;
  onClose: () => void;
}

export default function ErrorAlert({ message, onClose }: AlertBoxProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-sm p-6 text-center animate-pop">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle size={36} className="text-red-500" />
          <h2 className="text-lg font-semibold text-gray-800">Error</h2>
          <p className="text-sm text-gray-600">{message}</p>

          <button
            onClick={onClose}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-200"
          >
            OK
          </button>
        </div>
      </div>

      <style jsx>{`
        .animate-pop {
          animation: pop 0.25s ease-out;
        }
        @keyframes pop {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
