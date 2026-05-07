"use client";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import type { PaymentIntent } from "@stripe/stripe-js";

export default function StripeCardForm({
    amount,
    onSuccess,
}: {
    amount: number;
    onSuccess: (pi: PaymentIntent) => void;
}) {
    const stripe = useStripe();
    const elements = useElements();

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState("");

    const handlePayment = async () => {
        if (!stripe || !elements) return;

        try {
            setProcessing(true);
            setError("");

            // Get the origin for the return URL
            const returnUrl = `${window.location.origin}/payment/callback`;

            // confirmPayment handles all payment methods: cards, wallets, Klarna, etc.
            const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: returnUrl,
                },
                redirect: "if_required",
            });

            if (confirmError) {
                setError(confirmError.message || "Payment failed.");
                setProcessing(false);
                return;
            }

            // If no redirect is needed, payment succeeded
            if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
                onSuccess(paymentIntent);
            }
        } catch (err: any) {
            console.error(err);
            setError("Unexpected error during payment.");
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="border p-4 rounded-lg bg-gray-50">
                <PaymentElement />
            </div>

            {error && (
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
            )}

            <button
                className="w-full bg-black text-white py-3 rounded-lg mt-4 font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
                disabled={processing || !stripe || !elements}
                onClick={handlePayment}
            >
                {processing ? "Processing..." : `Pay £${amount.toFixed(2)}`}
            </button>
        </div>
    );
}
