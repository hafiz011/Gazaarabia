// "use client";

// import React from "react";
// import { PackageX } from "lucide-react";

// interface UnavailableStockAlertProps {
//   unavailableItems: {
//     name: string;
//     requestedQuantity: number;
//     availableStock: number;
//   }[];
//   onClose: () => void;
// }

// export default function UnavailableStockAlert({
//   unavailableItems,
//   onClose,
// }: UnavailableStockAlertProps) {
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md p-6 text-center animate-pop">
//         <div className="flex flex-col items-center gap-3">
//           <PackageX size={38} className="text-red-500" />
//           <h2 className="text-lg font-semibold text-gray-800">
//             Some items are out of stock
//           </h2>
//           <p className="text-sm text-gray-600 mb-3">
//             Please review your cart before proceeding to checkout.
//           </p>

//           {/* Scrollable item list */}
//           <div className="w-full max-h-60 overflow-y-auto border border-gray-100 rounded-md text-left px-4 py-2 bg-gray-50">
//             {unavailableItems.map((item, index) => (
//               <div
//                 key={index}
//                 className="py-2 border-b border-gray-200 last:border-0"
//               >
//                 <p className="font-medium text-gray-800">{item.name}</p>
//                 <p className="text-xs text-gray-600">
//                   Requested: {item.requestedQuantity} | Available:{" "}
//                   {item.availableStock}
//                 </p>
//               </div>
//             ))}
//           </div>

//           {/* Close Button */}
//           <button
//             onClick={onClose}
//             className="mt-5 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition-all duration-200"
//           >
//             OK
//           </button>
//         </div>
//       </div>

//       <style jsx>{`
//         .animate-pop {
//           animation: pop 0.25s ease-out;
//         }
//         @keyframes pop {
//           from {
//             transform: scale(0.9);
//             opacity: 0;
//           }
//           to {
//             transform: scale(1);
//             opacity: 1;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }


"use client";

import React from "react";
import { PackageX, AlertTriangle } from "lucide-react";

interface UnavailableStockAlertProps {
  unavailableItems: {
    name: string;
    requestedQuantity?: number;
    availableStock?: number;
    issues?: string[]; // new property to handle messages like price changes, removals, etc.
  }[];
  onClose: () => void;
}

export default function UnavailableStockAlert({
  unavailableItems,
  onClose,
}: UnavailableStockAlertProps) {
  const isIssueOnly = unavailableItems.every((item) => item.issues && !item.requestedQuantity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-md p-6 text-center animate-pop">
        <div className="flex flex-col items-center gap-3">
          {isIssueOnly ? (
            <AlertTriangle size={38} className="text-yellow-500" />
          ) : (
            <PackageX size={38} className="text-red-500" />
          )}

          <h2 className="text-lg font-semibold text-gray-800">
            {isIssueOnly ? "Cart Updated" : "Some Items Are Unavailable"}
          </h2>

          <p className="text-sm text-gray-600 mb-3 px-2">
            {isIssueOnly
              ? "We’ve updated your cart to match the latest product availability and pricing."
              : "Please review your cart before proceeding to checkout."}
          </p>

          {/* Scrollable item list */}
          <div className="w-full max-h-60 overflow-y-auto border border-gray-100 rounded-md text-left px-4 py-2 bg-gray-50">
            {unavailableItems.map((item, index) => (
              <div
                key={index}
                className="py-2 border-b border-gray-200 last:border-0 text-sm"
              >
                <p className="font-medium text-gray-800">{item.name}</p>

                {/* If item has issue messages (price/quantity change etc.) */}
                {item.issues && item.issues.length > 0 ? (
                  <ul className="list-disc ml-5 mt-1 text-gray-600 text-xs space-y-1">
                    {item.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  // Otherwise, show requested/available stock
                  <p className="text-xs text-gray-600">
                    Requested: {item.requestedQuantity ?? "-"} | Available:{" "}
                    {item.availableStock ?? "0"}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className={`mt-5 ${
              isIssueOnly
                ? "bg-yellow-600 hover:bg-yellow-700"
                : "bg-red-600 hover:bg-red-700"
            } text-white px-6 py-2 rounded-md font-medium transition-all duration-200`}
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
