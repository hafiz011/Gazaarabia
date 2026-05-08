"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";
import PopupAlert from "@/components/PopupAlert";
import { returnRequestSellerService } from "@/lib/services/seller/returnRequestService";
import { X, CheckCircle, Clock, XCircle } from "lucide-react";

export default function ReturnRequestDetailPage() {
    const { id } = useParams();
    const { data: session } = useSession();
    const token = session?.user?.token;

    const [reqData, setReqData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [adminNote, setAdminNote] = useState("");
    const [refundAmount, setRefundAmount] = useState<number | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [popup, setPopup] = useState({ isOpen: false, type: "", message: "" });

    // Disable scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = imagePreview ? "hidden" : "auto";
    }, [imagePreview]);

    useEffect(() => {
        if (token && id) fetchRequest();
    }, [token, id]);

    const fetchRequest = async () => {
        setLoading(true);
        const res = await returnRequestSellerService.getById(token!, Number(id));
        if (res.success) {
            setReqData(res.data);
            setAdminNote(res.data.adminNote || "");
            setRefundAmount(res.data.refundAmount || null);
        }
        setLoading(false);
    };

    const updateStatus = async (status: string) => {
        const res = await returnRequestSellerService.updateStatus(token!, Number(id), {
            status,
            adminNote,
            refundAmount,
        });

        if (res.success) {
            setPopup({ isOpen: true, type: "success", message: "Status updated successfully!" });
            fetchRequest();
        } else {
            setPopup({ isOpen: true, type: "error", message: res.message });
        }
    };

    if (loading || !reqData) return <Loader />;

    const product = reqData.orderItem.product;
    const variant = reqData.orderItem.variant;
    const images = reqData.images || [];

    // Build timeline dynamically
    const timeline =
        reqData.status === "rejected"
            ? [
                { key: "pending", label: "Submitted" },
                { key: "rejected", label: "Rejected" }
            ]
            : [
                { key: "pending", label: "Submitted" },
                { key: "approved", label: "Approved" },
                { key: "returned", label: "Returned" },
                { key: "refunded", label: "Refunded" }
            ];

    // Determine current step index
    let currentIndex = timeline.findIndex(t => t.key === reqData.status);

    // If rejected → only Submitted is active
    if (reqData.status === "rejected") currentIndex = 0;



    return (
        <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Return Request <span className="text-[var(--brand-primary)]">#{reqData.id}</span>
            </h1>

            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6 overflow-x-auto scrollbar-hide">
                <div className="flex items-center justify-between min-w-[600px] sm:min-w-0">

                    {timeline.map((step, index) => {
                        const isRejected = reqData.status === "rejected" && step.key === "rejected";

                        //  Submitted always completed
                        const isCompleted = reqData.status !== "rejected"
                            ? index <= currentIndex
                            : index === 0;

                        return (
                            <div key={step.key} className="flex-1 flex items-center">

                                {/* Node */}
                                <div className="flex flex-col items-center relative shrink-0">
                                    <div
                                        className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 transition
                    ${isRejected
                                                ? "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white"
                                                : isCompleted
                                                    ? "bg-[var(--brand-secondary)] border-[var(--brand-secondary)] text-white"
                                                    : "border-[var(--mid-gray)] text-[var(--mid-gray)]"
                                            }`}
                                    >
                                        {isRejected ? <XCircle size={16} className="sm:size-[18px]" /> : <CheckCircle size={16} className="sm:size-[18px]" />}
                                    </div>

                                    <p className="mt-2 text-[10px] sm:text-xs font-bold text-gray-600 whitespace-nowrap">
                                        {step.label}
                                    </p>
                                </div>

                                {/* Connector */}
                                {index < timeline.length - 1 && (
                                    <div
                                        className={`flex-1 h-[2px] mx-2
                    ${isRejected && step.key === "approved"
                                                ? "bg-[var(--mid-gray)]"
                                                : isRejected
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
            </div>


            {/* PRODUCT + CUSTOMER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div className="bg-white rounded-xl shadow border p-6">
                    <h2 className="text-lg font-semibold mb-4">Product Details</h2>
                    <div className="flex gap-4">
                        <img
                            src={product.productimage?.[0]?.url}
                            className="w-32 h-32 rounded-lg border object-cover cursor-pointer hover:scale-105 transition"
                            onClick={() => setImagePreview(product.productimage?.[0]?.url)}
                        />
                        <div>
                            <p className="font-medium">{product.title}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{variant?.color?.name} / {variant?.size?.name}</p>
                            <p className="text-sm text-[var(--text-secondary)] mt-1">Qty: {reqData.orderItem.quantity}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow border p-6">
                    <h2 className="text-lg font-semibold mb-4">Customer Info</h2>
                    <p className="font-medium">{reqData.user.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">{reqData.user.email}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Order #{reqData.orderId}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Item Subtotal: £{reqData.orderItem?.subtotal}</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Expected Return Amount: £{reqData.expectedReturnAmount}</p>
                    {reqData.status === "refunded" &&
                        <p className="text-sm text-[var(--text-muted)] mt-1">Returned Amount: £{reqData.refundAmount}</p>
                    }
                </div>
            </div>

            {/* RETURN DETAILS */}
            <div className="bg-white rounded-xl shadow border p-6 space-y-6">
                <h2 className="text-lg font-semibold">Return Details</h2>

                <p className="font-medium">{reqData.reason.label}</p>

                {reqData.note && (
                    <p className="mt-2 p-3 bg-[var(--soft-gray)] rounded-lg text-[var(--text-secondary)]">
                        {reqData.note}
                    </p>
                )}

                {images.length > 0 && (
                    <div>
                        <h3 className="font-medium mb-2">Uploaded Images</h3>
                        <div className="flex gap-3 flex-wrap">
                            {images.map((img: string, i: number) => (
                                <img
                                    key={i}
                                    src={img}
                                    className="w-28 h-28 rounded-lg border object-cover cursor-pointer hover:scale-105 transition"
                                    onClick={() => setImagePreview(img)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ADMIN REVIEW */}
            <div className="bg-white rounded-xl shadow border p-6 space-y-6">
                <h2 className="text-lg font-semibold">Admin Review</h2>

                <textarea
                    className="w-full border rounded px-3 py-2"
                    placeholder="Admin note"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    disabled={reqData.status === "rejected"}
                />

                {reqData.status === "returned" && (
                    <input
                        type="number"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Refund Amount"
                        value={refundAmount || ""}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                    />
                )}

                {reqData.status !== "rejected" && (
                    <div className="flex justify-end gap-3">

                        {reqData.status === "pending" && (
                            <>
                                <button
                                    onClick={() => updateStatus("approved")}
                                    className="px-4 py-2 rounded bg-[var(--brand-secondary)] text-white hover:bg-green-700 transition"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => updateStatus("rejected")}
                                    className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-red-700 transition"
                                >
                                    Reject
                                </button>
                            </>
                        )}

                        {reqData.status === "approved" && (
                            <button
                                onClick={() => updateStatus("returned")}
                                className="px-4 py-2 rounded border bg-[var(--light-blue)] text-[var(--navy-blue)] hover:bg-blue-300 transition"
                            >
                                Mark Returned
                            </button>
                        )}

                        {reqData.status === "returned" && (
                            <button
                                onClick={() => updateStatus("refunded")}
                                className="px-4 py-2 rounded bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)] transition"
                            >
                                Mark Refunded
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Full Image Modal */}
            {imagePreview && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex justify-center items-center p-4">
                    <button
                        className="absolute top-5 right-5 text-white hover:text-[var(--brand-primary)]"
                        onClick={() => setImagePreview(null)}
                    >
                        <X size={32} />
                    </button>
                    <img src={imagePreview} className="max-w-full max-h-[90vh] rounded-xl shadow-xl" />
                </div>
            )}

            <PopupAlert
                show={popup.isOpen}
                type={popup.type as any}
                message={popup.message}
                onConfirm={() => setPopup({ ...popup, isOpen: false })}
            />
        </div>
    );
}
