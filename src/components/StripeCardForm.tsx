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

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: "if_required",
            });

            if (error) {
                setError(error.message || "Payment failed.");
                setProcessing(false);
                return;
            }

            onSuccess(paymentIntent!);
        } catch (err: any) {
            console.error(err);
            setError("Unexpected error during payment.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <div className="border p-4 rounded-lg bg-gray-50">
                <PaymentElement />
            </div>

            {error && (
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
            )}

            <button
                className="w-full bg-black text-white py-3 rounded-lg mt-4 font-semibold"
                disabled={processing}
                onClick={handlePayment}
            >
                {processing ? "Processing..." : `Pay £${amount.toFixed(2)}`}
            </button>
        </>
    );
}
