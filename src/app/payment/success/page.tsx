"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Optional: Redirect to home/dashboard after 5 seconds
        const timer = setTimeout(() => {
            router.push("/");
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
                <div className="mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl text-green-600">✓</span>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful</h1>

                <p className="text-gray-600 mb-6">
                    Your payment has been processed successfully. Thank you for your purchase!
                </p>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="block w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 font-semibold"
                    >
                        Return to Home
                    </Link>
                    <Link
                        href="/dashboard"
                        className="block w-full bg-gray-200 text-black px-6 py-3 rounded-lg hover:bg-gray-300 font-semibold"
                    >
                        Go to Dashboard
                    </Link>
                </div>

                <p className="text-xs text-gray-500 mt-4">
                    Redirecting in 5 seconds...
                </p>
            </div>
        </div>
    );
}
