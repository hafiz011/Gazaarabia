"use client";

import { useState } from "react";
import AlertMessage from "@/components/AlertMessage";
import { Mail, Loader2 } from "lucide-react";
import { authService } from "@/lib/services/authService";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        isOpen: false,
        type: "",
        message: "",
    });

    const submitHandler = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.forgotPassword(email);

            setAlert({
                isOpen: true,
                type: data.success ? "success" : "error",
                message: data.message,
            });

            if (data.success) setEmail("");

        } catch (err: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Something went wrong",
            });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 px-4">
            <div className="bg-white shadow-2xl p-8 rounded-2xl w-full max-w-md border border-gray-200">

                {/* Title Section */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Forgot Password?</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Enter your email address to receive a reset link.
                    </p>
                </div>

                {/* Alert */}
                {alert.isOpen && (
                    <AlertMessage
                        type={alert.type as any}
                        message={alert.message}
                        onClose={() => setAlert({ ...alert, isOpen: false })}
                    />
                )}

                {/* Form */}
                <form onSubmit={submitHandler} className="space-y-5">

                    {/* Email Field */}
                    <div className="relative">
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full border rounded-xl px-10 py-3 text-gray-700 focus:ring-2 focus:ring-[var(--brand-primary)]/60 transition outline-none"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--brand-primary)] text-white rounded-xl py-3 font-medium text-lg flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading && <Loader2 className="animate-spin h-5 w-5" />}
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>

                    {/* Small Note */}
                    <p className="text-center text-gray-500 text-sm mt-3">
                        You will receive an email if the address is associated with an account.
                    </p>
                </form>

            </div>
        </div>
    );
}
