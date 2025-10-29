"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import AlertMessage from "@/components/AlertMessage";
import { signIn, useSession } from "next-auth/react";
import { ROUTES } from "@/constants/routes"; //  central URL config

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession(); // get session info

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "";
    message: string;
  }>({
    isOpen: false,
    type: "",
    message: "",
  });

  // Redirect if user already logged in
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated") {
      if (session?.user?.role === "customer") {
        router.replace(ROUTES.USER.PROFILE); //  redirect to profile
      } else {
        router.replace("/"); // or some other route for admins
      }
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email.trim() || !form.password.trim()) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Please enter both email and password.",
      });
      return;
    }

    try {
      setLoading(true);
      const response: any = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (response?.error) {
        setAlert({
          isOpen: true,
          type: "error",
          message: response?.error?.message || "Invalid email or password.",
        });
        return;
      }

      setAlert({
        isOpen: true,
        type: "success",
        message: "Login successful! Redirecting...",
      });

      setTimeout(() => {
        router.push(ROUTES.USER.PROFILE); //  redirect after login
      }, 1000);
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-[var(--background)] px-4 pt-20 pb-10">
      <div className="mt-5 w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-[var(--soft-gray)] transition-all duration-300 hover:shadow-xl">
      
        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Log in to your account to continue
          </p>
        </div>

          {/* Alert */}
        {alert.isOpen && alert.type && (
          <div className="mb-4">
            <AlertMessage
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
            />
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-[var(--soft-gray)] rounded-md px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border border-[var(--soft-gray)] rounded-md px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-[var(--text-muted)]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[var(--brand-primary)] text-white py-3 rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition ${loading && "opacity-60 cursor-not-allowed"
              }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Sign up link */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          Don’t have an account?{" "}
          <a
            href="/account/register"
            className="text-[var(--brand-primary)] font-medium hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
