"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { ROUTES } from "@/constants/routes";
import { loadWithExpiry, saveWithExpiry } from "@/lib/helpers/localExpiry";

export default function ContentManagerLoginPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: "",
        password: "",
        rememberMe: false,
    });

    const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});
    const [alert, setAlert] = useState({
        isOpen: false,
        type: "" as "success" | "error" | "",
        message: "",
    });

    // ================================
    // Load Remembered Email on Mount
    // ================================
    useEffect(() => {
        const rememberedEmail = loadWithExpiry("gaza_arabia_remember_content_manager");
        if (rememberedEmail) {
            setForm((p) => ({ ...p, email: rememberedEmail, rememberMe: true }));
        }
    }, []);

    // ================================
    // Validation
    // ================================
    const validate = () => {
        const e: any = {};
        if (!form.email) e.email = "Email is required";
        if (!form.password) e.password = "Password is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ================================
    // Redirect if already logged in
    // ================================
    useEffect(() => {
        if (status === "loading") return;

        if (status === "authenticated") {
            if (session?.user?.role === "content_manager") {
                router.replace(ROUTES.CONTENT_MANAGER.BLOGS);
            } else {
                router.replace("/");
            }
        }
    }, [status, session, router]);

    // ================================
    // Submit Handler
    // ================================
    const onSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!validate()) return;

        try {
            setLoading(true);

            const response: any = await signIn("credentials", {
                redirect: false,
                email: form.email,
                password: form.password,
                role: "content_manager",
            });

            if (response?.error) {
                setAlert({
                    isOpen: true,
                    type: "error",
                    message: response.error || "Invalid login credentials.",
                });
                return;
            }

            // Remember Me logic
            if (form.rememberMe) {
                saveWithExpiry("gaza_arabia_remember_content_manager", form.email);
            } else {
                localStorage.removeItem("gaza_arabia_remember_content_manager");
            }

            setForm({
                email: "",
                password: "",
                rememberMe: false
            })


            setAlert({
                isOpen: true,
                type: "success",
                message: "Login successful! Redirecting...",
            });


            router.replace(ROUTES.CONTENT_MANAGER.BLOGS);

        } catch (err: any) {
            setAlert({
                isOpen: true,
                type: "error",
                message: err.message || "Login failed.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[var(--brand-primary)] opacity-10 blur-3xl"></div>

            <div className="w-full max-w-md mx-4 z-10">
                <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">

                    {/* Header */}
                    <div className="px-6 py-8 text-center bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white">
                        <div className="mb-2 flex justify-center">
                            <div className="h-14 w-14 bg-white text-[var(--brand-primary)] font-bold text-2xl flex items-center justify-center rounded-xl shadow">
                                C
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold">Content Manager Login</h1>
                        <p className="text-sm opacity-90 mt-1">Access your content panel securely</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmit} className="px-6 py-8 space-y-6 bg-white">
                        {alert.isOpen && alert.type && (
                            <AlertMessage
                                type={alert.type}
                                message={alert.message}
                                onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
                            />
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className={`w-full rounded-xl border px-10 py-2.5 text-sm 
                    ${errors.email ? "border-red-500" : "border-gray-300"}`}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <a
                                    href="/forgot-password"
                                    className="text-xs text-[var(--brand-primary)] hover:underline"
                                >
                                    Forgot password?
                                </a>
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className={`w-full rounded-xl border px-10 py-2.5 text-sm 
                    ${errors.password ? "border-red-500" : "border-gray-300"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-2.5 text-gray-400"
                                >
                                    {showPassword ? <EyeOff /> : <Eye />}
                                </button>
                            </div>

                            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={form.rememberMe}
                                onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)]"
                            />
                            <span className="text-sm text-gray-700">Remember me</span>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl text-white py-2.5 text-sm font-medium"
                            style={{ background: "var(--gradient-primary)" }}
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                        <p className="text-xs text-center text-gray-500">
                            This page is restricted to authorized content managers only.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
