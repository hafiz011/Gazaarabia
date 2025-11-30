"use client";

import { useEffect, useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import AlertMessage from "@/components/AlertMessage";
import { loadWithExpiry, saveWithExpiry } from "@/lib/helpers/localExpiry";

export default function AffiliateLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", rememberMe: false });
  const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "";
    message: string;
  }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const validate = () => {
    const e: typeof errors = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Redirect if already logged in
  useEffect(() => {
    if (status !== "authenticated") return;

    if (session?.user?.role === "affiliate") {
      router.replace(ROUTES.AFFILIATE.DASHBOARD);
    }
  }, [status, session, router]);



  useEffect(() => {
    const rememberedEmail = loadWithExpiry("gaza_arabia_remember_affiliate");
    if (rememberedEmail) {
      setForm((p) => ({ ...p, email: rememberedEmail, remember: true }));
    }
  }, []);


  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const response: any = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
        role: 'affiliate'
      });

      if (response?.error) {
        setAlert({
          isOpen: true,
          type: "error",
          message: response.error || "Invalid email or password.",
        });
        return;
      }


      if (form.rememberMe) {
        saveWithExpiry("gaza_arabia_remember_affiliate", form.email);
      } else {
        localStorage.removeItem("gaza_arabia_remember_affiliate");
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

      setTimeout(() => {
        router.push(ROUTES.AFFILIATE.DASHBOARD);
      }, 1000);
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[var(--brand-primary)] opacity-10 blur-3xl" />

      <div className="w-full max-w-md mx-4 z-10">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-6 py-8 text-center bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white">
            <div className="mb-2 flex justify-center">
              <div className="h-14 w-14 bg-white text-[var(--brand-primary)] font-bold text-2xl flex items-center justify-center rounded-xl shadow">
                AF
              </div>
            </div>
            <h1 className="text-2xl font-bold">Affiliate Login</h1>
            <p className="text-sm opacity-90 mt-1">Access your affiliate dashboard</p>
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
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="affiliate@company.com"
                  className={`w-full rounded-xl border px-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition 
                    ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[var(--brand-primary)]/30"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border px-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition 
                    ${errors.password ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[var(--brand-primary)]/30"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.rememberMe}
                  onChange={(e) => setForm((p) => ({ ...p, rememberMe: e.target.checked }))}
                  className="cursor-pointer"
                />
                Remember Me
              </label>

              <a
                href="/forgot-password"
                className="text-[var(--brand-primary)] text-sm font-medium hover:underline cursor-pointer"
              >
                Forgot Password?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl text-white py-2.5 text-sm font-medium transition
                ${loading ? "opacity-90 cursor-not-allowed" : "hover:brightness-110"}`}
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <p className="text-xs text-center text-gray-500">
              Don’t have an affiliate account?{" "}
              <a href="/affiliate/register" className="text-[var(--brand-primary)] hover:underline font-medium">
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
