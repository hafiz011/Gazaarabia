"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentCallbackPage() {
    const searchParams = useSearchParams();
    const redirectStatus = searchParams.get("redirect_status");
    
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<"processing" | "succeeded" | "failed">("processing");
    const [message, setMessage] = useState("Processing your payment...");

    useEffect(() => {
        const retrievePaymentStatus = async () => {
            try {
                if (redirectStatus === "succeeded") {
                    setStatus("succeeded");
                    setMessage("Payment successful! Redirecting...");
                    setTimeout(() => {
                        window.location.href = "/payment/success";
                    }, 2000);
                } else if (redirectStatus === "processing") {
                    setStatus("processing");
                    setMessage("Payment is being processed.");
                    setTimeout(() => {
                        window.location.href = "/payment/success";
                    }, 3000);
                } else if (redirectStatus === "failed") {
                    setStatus("failed");
                    setMessage("Payment failed. Please try again.");
                } else {
                    const clientSecret = searchParams.get("payment_intent_client_secret");
                    if (clientSecret) {
                        setStatus("succeeded");
                        setMessage("Payment completed! Redirecting...");
                        setTimeout(() => {
                            window.location.href = "/payment/success";
                        }, 2000);
                    } else {
                        setStatus("failed");
                        setMessage("Unable to determine payment status.");
                    }
                }
            } catch (err: any) {
                console.error("Error:", err);
                setStatus("failed");
                setMessage("Error retrieving payment status.");
            } finally {
                setLoading(false);
            }
        };

        retrievePaymentStatus();
    }, [redirectStatus, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                {loading ? (
                    <div>
                        <div className="mb-4">
                            <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto"></div>
                        </div>
                        <p className="text-gray-600">{message}</p>
                    </div>
                ) : status === "succeeded" ? (
                    <div>
                        <div className="mb-4 text-4xl">✓</div>
                        <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful</h1>
                        <p className="text-gray-600">{message}</p>
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 text-4xl">✕</div>
                        <h1 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h1>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <Link
                            href="/"
                            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-900"
                        >
                            Return to Home
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
