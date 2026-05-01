"use client";
import { useStripe, useElements, PaymentElement, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
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
    const [paymentRequest, setPaymentRequest] = useState<any>(null);

    useEffect(() => {
        if (stripe) {
            const pr = stripe.paymentRequest({
                country: "GB",
                currency: "gbp",
                total: {
                    label: "Total Amount",
                    amount: Math.round(amount * 100),
                },
                requestPayerName: true,
                requestPayerEmail: true,
            });

            // Check the availability of the Payment Request API first.
            pr.canMakePayment().then((result) => {
                if (result) {
                    setPaymentRequest(pr);
                }
            });

            pr.on("paymentmethod", async (ev) => {
                // Confirm the PaymentIntent on the client
                const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
                    (elements as any)._commonOptions.clientSecret, // Get clientSecret from elements context
                    { payment_method: ev.paymentMethod.id },
                    { handleActions: false }
                );

                if (confirmError) {
                    // Report to the browser that the payment failed, prompting it to
                    // re-show the payment interface, or show an error message and close
                    // the payment interface.
                    ev.complete("fail");
                    setError(confirmError.message || "Payment failed.");
                } else {
                    // Report to the browser that the confirmation was successful, prompting
                    // it to close the browser payment interface.
                    ev.complete("success");
                    // Check if the PaymentIntent requires any actions and if so let Stripe.js handle them
                    if (paymentIntent.status === "requires_action") {
                        // Let Stripe.js handle the rest of the payment flow.
                        const { error: actionError } = await stripe.confirmCardPayment((elements as any)._commonOptions.clientSecret);
                        if (actionError) {
                            setError(actionError.message || "Action failed.");
                        } else {
                            onSuccess(paymentIntent);
                        }
                    } else {
                        // The payment has succeeded.
                        onSuccess(paymentIntent);
                    }
                }
            });
        }
    }, [stripe, amount, elements, onSuccess]);

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
        <div className="space-y-6">
            {paymentRequest && (
                <div className="mb-6">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Express Checkout</p>
                    <PaymentRequestButtonElement options={{ paymentRequest }} />
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-300"></span>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or pay with card</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="border p-4 rounded-lg bg-gray-50">
                <PaymentElement />
            </div>

            {error && (
                <p className="text-red-600 text-sm mt-2 text-center">{error}</p>
            )}

            <button
                className="w-full bg-black text-white py-3 rounded-lg mt-4 font-semibold hover:bg-gray-900 transition-colors disabled:opacity-50"
                disabled={processing}
                onClick={handlePayment}
            >
                {processing ? "Processing..." : `Pay £${amount.toFixed(2)}`}
            </button>
        </div>
    );
}
