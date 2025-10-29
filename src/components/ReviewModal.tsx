"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { reviewService } from "@/lib/services/front-end/reviewService";
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";

interface ReviewModalProps {
  productId: number | null;
  variantId?: number | null;
  orderItemId: number;
  token: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReviewModal({
  productId,
  variantId = null,
  orderItemId,
  token,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ For popup alert
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "";
    message: string;
  }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleSubmit = async () => {
    if (!productId || rating === 0) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Please select a rating before submitting.",
      });
      return;
    }

    try {
      setLoading(true);
      await reviewService.create(token, {
        orderItemId,
        productId,
        rating,
        comment: reviewText,
        ...(variantId ? { variantId } : {}),
      });

      setAlert({
        isOpen: true,
        type: "success",
        message: "Review submitted successfully!",
      });

      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1200);
    } catch (error: any) {
      console.error("❌ Failed to submit review", error);
      setAlert({
        isOpen: true,
        type: "error",
        message:
          error?.message || "Failed to submit review. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-6 relative">
       
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-[var(--brand-primary)]"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
          Write a Review
        </h3>

         {/* 🔔 Alert Message */}
        {alert.isOpen && alert.type && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert((prev) => ({ ...prev, isOpen: false }))}
          />
        )}

        {/* ⭐ Rating */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={24}
              onClick={() => setRating(star)}
              className={`cursor-pointer ${
                star <= rating
                  ? "fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>

        {/* 📝 Review Text */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review..."
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          rows={4}
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || loading}
          className={`mt-4 w-full py-2 rounded-lg font-semibold transition
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-secondary)]"
            }`}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </button>
      </div>
    </div>
  );
}
