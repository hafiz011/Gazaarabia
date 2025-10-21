"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState<{ email?: string; password?: string; root?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.email) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";

    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors((p) => ({ ...p, root: undefined }));

    const res = await signIn("credentials", {
      redirect: false, // so we can handle the redirect manually
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (res?.error) {
      setErrors((p) => ({ ...p, root: "Invalid email or password" }));
    } else {
      router.push("/admin/dashboard"); // ✅ Protected page
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden">
      {/* Background gradient blob */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[400px] w-[400px] rounded-full bg-[var(--brand-primary)] opacity-10 blur-3xl" />

      <div className="w-full max-w-md mx-4 z-10">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="px-6 py-8 text-center bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white">
            <div className="mb-2 flex justify-center">
              <div className="h-14 w-14 bg-white text-[var(--brand-primary)] font-bold text-2xl flex items-center justify-center rounded-xl shadow">
                A
              </div>
            </div>
            <h1 className="text-2xl font-bold">Admin Sign in</h1>
            <p className="text-sm opacity-90 mt-1">Access your admin dashboard securely</p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="px-6 py-8 space-y-6 bg-white">
            {errors.root && (
              <div className="text-sm text-white bg-[var(--brand-primary)] rounded-lg px-4 py-2 text-center">
                {errors.root}
              </div>
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
                  placeholder="admin@yourcompany.com"
                  className={`w-full rounded-xl border px-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition 
                    ${errors.email ? "border-red-500 focus:ring-red-200" : "border-gray-300 focus:ring-[var(--brand-primary)]/30"}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <a href="#" className="text-xs text-[var(--brand-primary)] hover:underline">
                  Forgot password?
                </a>
              </div>
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) => setForm((p) => ({ ...p, remember: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
              />
              <span className="text-sm text-gray-700">Remember me</span>
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

            {/* Footnote */}
            <p className="text-xs text-center text-gray-500">
              This page is restricted to authorized administrators only.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
