"use client";

import { useEffect, useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import PopupAlert from "@/components/PopupAlert";
import { returnReasonService } from "@/lib/services/front-end/returnReasonService";
import { uploadService } from "@/lib/services/uploadService";
import { returnRequestService } from "@/lib/services/front-end/returnRequestService";

export default function ReturnRequestModal({
    orderId,
    orderItemId,
    token,
    onClose,
    onSuccess,
}: {
    orderId: number;
    orderItemId: number;
    token: string;
    onClose: () => void;
    onSuccess: () => void;
}) {

    useEffect(() => {
        // Prevent background scroll
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const [reasons, setReasons] = useState<any[]>([]);
    const [reasonId, setReasonId] = useState<number | null>(null);
    const [note, setNote] = useState("");
    const [images, setImages] = useState<string[]>([]);

    const [requireImage, setRequireImage] = useState(false);

    const [loading, setLoading] = useState(false);
    const [popupData, setPopupData] = useState<any>({
        isOpen: false,
        type: "",
        message: "",
    });

    const fileRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        const fetchReasons = async () => {
            if (!token) return;
            const res = await returnReasonService.getAllReasons(token);
            if (res.success) setReasons(res.data);
        };
        fetchReasons();
    }, [token]);


    // When user selects reason — update requireImage
    useEffect(() => {
        if (!reasonId) return;
        const selected = reasons.find((r) => r.id === reasonId);
        setRequireImage(selected?.requireImage ?? false);
    }, [reasonId, reasons]);

    const handleImageUpload = async (e: any) => {
        const files: any = Array.from(e.target.files || []);
        if (files.length === 0) return;

        try {
            const urls = await uploadService.uploadMultiple(files, "returns");
            setImages((prev) => [...prev, ...urls]);
        } catch (error: any) {
            setPopupData({
                isOpen: true,
                type: "error",
                message: error.message || "Image upload failed.",
            });
        }
    };


    const handleSubmit = async () => {
        if (!reasonId)
            return setPopupData({
                isOpen: true,
                type: "error",
                message: "Please select a return reason.",
            });

        if (requireImage && images.length === 0)
            return setPopupData({
                isOpen: true,
                type: "error",
                message: "This reason requires an image.",
            });

        setLoading(true);
        try {
            const response = await returnRequestService.submit(token, {
                orderId,
                orderItemId,
                reasonId,
                note,
                images,
            });

            if (!response.success) {
                return setPopupData({
                    isOpen: true,
                    type: "error",
                    message: response.message,
                });
            }

            //  Only here we call success
            onSuccess();

        } catch (err: any) {
            setPopupData({
                isOpen: true,
                type: "error",
                message: err.message || "Something went wrong.",
            });
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700">
                    <X size={20} />
                </button>

                <h2 className="text-lg font-semibold mb-4">Return Item</h2>

                {/* Reason Dropdown */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                    value={reasonId || ""}
                    onChange={(e) => setReasonId(Number(e.target.value))}
                    className="w-full border rounded px-3 py-2 mb-4"
                >
                    <option value="">Select return reason</option>
                    {reasons.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.label}
                        </option>
                    ))}
                </select>

                {/* Image Upload (Conditional) */}
                {requireImage && (
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Images</label>

                        <input
                            type="file"
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            multiple
                            className="hidden"
                            ref={fileRef}
                            onChange={handleImageUpload}
                        />

                        <div
                            className="w-32 h-32 border rounded flex items-center justify-center cursor-pointer bg-gray-50 hover:border-[var(--brand-primary)] mb-3"
                            onClick={() => fileRef.current?.click()}
                        >
                            <span className="flex flex-col items-center text-gray-400 text-sm">
                                <Upload size={22} />
                                Upload
                            </span>
                        </div>

                        {/* Preview multiple images */}
                        <div className="flex flex-wrap gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20">
                                    <img src={img} alt="Return Upload" className="w-full h-full object-cover rounded border" />
                                    <button
                                        type="button"
                                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* note */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    className="w-full border rounded px-3 py-2 mb-4 resize-none"
                    placeholder="Describe the issue..."
                />

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)]"
                    >
                        {loading ? "Submitting..." : "Submit Return"}
                    </button>
                </div>
            </div>

            <PopupAlert
                type={popupData.type}
                message={popupData.message}
                confirmText="OK"
                onConfirm={() => setPopupData((prev: any) => ({ ...prev, isOpen: false }))}
                show={popupData.isOpen}
            />
        </div>
    );
}
