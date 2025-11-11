"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";

export default function ReturnStatusModal({ returnRequest, onClose }: any) {

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // ✅ Disable background scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    // ✅ Disable scroll when viewing full image
    useEffect(() => {
        if (imagePreview) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "hidden"; // Keep locked for modal
    }, [imagePreview]);

    if (!returnRequest) return null;

    const timeline = returnRequest.status === "rejected"
        ? [
            { key: "pending", label: "Submitted" },
            { key: "approved", label: "Approved" },
            { key: "returned", label: "Returned" },
            { key: "refunded", label: "Refunded" },
            { key: "rejected", label: "Rejected" },
        ]
        : [
            { key: "pending", label: "Submitted" },
            { key: "approved", label: "Approved" },
            { key: "returned", label: "Returned" },
            { key: "refunded", label: "Refunded" },
        ];

    // ✅ Same rejected logic as admin
    let currentIndex = timeline.findIndex(t => t.key === returnRequest.status);
    if (returnRequest.status === "rejected") currentIndex = 0;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl w-full max-w-xl p-6 relative shadow-lg">

                {/* Close Button */}
                <button className="absolute top-4 right-4 text-gray-600 hover:text-black" onClick={onClose}>
                    <X size={26} />
                </button>

                <h2 className="text-xl font-semibold mb-5">Return Request Status</h2>

                {/*  Timeline (Responsive) */}
                <div className="rounded-xl border p-4 mb-6">
                    {/* Desktop Horizontal */}
                    <div className="hidden md:flex items-center justify-between w-full">
                        {timeline.map((step, index) => {
                            const isRejected = returnRequest.status === "rejected" && step.key === "rejected";
                            const isCompleted = returnRequest.status !== "rejected"
                                ? index <= currentIndex
                                : index === 0;

                            return (
                                <div key={step.key} className="flex items-center w-full">

                                    {/* Circle + Label */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 flex items-center justify-center rounded-full border-2
                        ${isRejected
                                                    ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white"
                                                    : isCompleted
                                                        ? "bg-[var(--brand-secondary)] border-[var(--brand-secondary)] text-white"
                                                        : "border-[var(--mid-gray)] text-[var(--mid-gray)]"
                                                }`}
                                        >
                                            {isRejected ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                        </div>
                                        <p className="mt-2 text-xs font-medium text-[var(--text-secondary)] text-center">{step.label}</p>
                                    </div>

                                    {/* Connector Line */}
                                    {index < timeline.length - 1 && (
                                        <div className={`h-[2px] flex-1 mx-3 self-center
                        ${isRejected
                                                ? "bg-[var(--brand-primary)]"
                                                : isCompleted
                                                    ? "bg-[var(--brand-secondary)]"
                                                    : "bg-[var(--mid-gray)]"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>


                    {/* Mobile Vertical */}
                    <div className="md:hidden flex flex-col gap-4">
                        {timeline.map((step, index) => {
                            const isRejected = returnRequest.status === "rejected" && step.key === "rejected";
                            const isCompleted = returnRequest.status !== "rejected"
                                ? index <= currentIndex
                                : index === 0;

                            return (
                                <div key={step.key} className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition
            ${isRejected
                                                ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white"
                                                : isCompleted
                                                    ? "bg-[var(--brand-secondary)] border-[var(--brand-secondary)] text-white"
                                                    : "border-[var(--mid-gray)] text-[var(--mid-gray)]"
                                            }`}
                                    >
                                        {isRejected ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                    </div>
                                    <span className="text-sm text-[var(--text-secondary)]">{step.label}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ✅ Reason */}
                <p className="text-sm">
                    <strong>Reason:</strong> {returnRequest.reason.label}
                </p>

                {/* ✅ Customer Note */}
                {returnRequest.note && (
                    <p className="mt-2 p-3 bg-gray-100 rounded text-sm">
                        <strong>Your Note:</strong> {returnRequest.note}
                    </p>
                )}

                {/* ✅ Admin Note */}
                {returnRequest.adminNote && (
                    <p className="mt-2 p-3 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-sm">
                        <strong>Admin Response:</strong> {returnRequest.adminNote}
                    </p>
                )}

                {/* ✅ Refund */}
                {returnRequest.status === "refunded" && returnRequest.refundAmount && (
                    <p className="mt-2 p-3 bg-green-50 border border-green-300 text-green-800 rounded text-sm">
                        <strong>Refunded:</strong> £{returnRequest.refundAmount.toFixed(2)}
                    </p>
                )}

                {/* ✅ Uploaded Images */}
                {returnRequest.images?.length > 0 && (
                    <div className="mt-5">
                        <strong className="text-sm block mb-2">Submitted Images</strong>
                        <div className="flex gap-3 flex-wrap">
                            {returnRequest.images.map((img: string, i: number) => (
                                <img
                                    key={i}
                                    src={img}
                                    onClick={() => setImagePreview(img)}
                                    className="w-24 h-24 rounded-lg border object-cover cursor-pointer hover:scale-105 transition"
                                />
                            ))}
                        </div>
                    </div>
                )}

            </div>

            {/* ✅ Full Image Modal */}
            {imagePreview && (
                <div className="fixed inset-0 bg-black/80 z-[10000] flex justify-center items-center p-4">
                    <button
                        className="absolute top-5 right-5 text-white hover:text-red-400 transition"
                        onClick={() => setImagePreview(null)}
                    >
                        <X size={32} />
                    </button>
                    <img src={imagePreview} className="max-w-full max-h-[90vh] rounded-xl shadow-xl" />
                </div>
            )}
        </div>
    );
}
