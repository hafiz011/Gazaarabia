"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import AlertMessage from "@/components/AlertMessage";
import { authService } from "@/lib/services/authService";

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const token = params.get("token");
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [alert, setAlert] = useState({
        isOpen: false,
        type: "",
        message: "",
    });


    const MIN_LENGTH = 8;

    const passwordChangeHandler = (value: string) => {
        setPassword(value);

        if (value.length < MIN_LENGTH) {
            setAlert({
                isOpen: true,
                type: "error",
                message: `Password must be at least ${MIN_LENGTH} characters`,
            });
        } else {
            setAlert({
                isOpen: false,
                type: "",
                message: ""
            });
        }
    };


    const submitHandler = async (e: any) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.resetPassword(token!, password);

            setAlert({
                isOpen: true,
                type: data.success ? "success" : "error",
                message: data.message,
            });

            if (data.success) {
                setTimeout(() => router.replace("/login"), 1200);
            }

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
                    <h1 className="text-3xl font-bold text-gray-800">Reset Password</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Choose a strong and secure password
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

                    <div className="relative">
                        <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />

                        <input
                            type={isVisible ? "text" : "password"}
                            className="w-full border rounded-xl px-10 py-3 text-gray-700 focus:ring-2 focus:ring-[var(--brand-primary)]/60 transition outline-none"
                            placeholder="Enter your new password"
                            value={password}
                            // onChange={(e) => setPassword(e.target.value)}
                            onChange={(e) => passwordChangeHandler(e.target.value)}
                            required
                        />

                        {/* Password visibility toggle */}
                        <button
                            type="button"
                            className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                            onClick={() => setIsVisible(!isVisible)}
                        >
                            {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--brand-primary)] text-white rounded-xl py-3 font-medium text-lg flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition disabled:opacity-50"
                    >
                        {loading && <Loader2 className="animate-spin h-5 w-5" />}
                        {loading ? "Updating..." : "Reset Password"}
                    </button>

                    {/* Bottom Info */}
                    <p className="text-center text-gray-500 text-sm mt-3">
                        Need help?{" "}
                        <span
                            className="text-[var(--brand-primary)] font-medium cursor-pointer hover:underline"
                            onClick={() => router.push("/contact")}
                        >
                            Contact Support
                        </span>
                    </p>

                </form>
            </div>
        </div>
    );
}
