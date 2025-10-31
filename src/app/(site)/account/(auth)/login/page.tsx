"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { getSession } from "next-auth/react";
import AlertMessage from "@/components/AlertMessage";
import { ROUTES } from "@/constants/routes";
import { mergeLocalCartWithServer } from "@/lib/services/front-end/cartMergeService";
import { useCart } from "@/app/context/CartContext";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { refreshCart } = useCart();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "",
    message: "",
  });

  // ✅ React to successful login (wait until NextAuth session is ready)
  useEffect(() => {
    if (status === "authenticated" && session?.user?.token) {
      (async () => {
        try {
          const token = session.user.token;
          await mergeLocalCartWithServer(token);
          await refreshCart(); // Updates global cart count
          router.replace(ROUTES.USER.PROFILE);
        } catch (err) {
          console.warn("Cart merge or refresh failed:", err);
        }
      })();
    }
  }, [status, session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Clean, professional login function
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
      const response = await signIn("credentials", {
        redirect: false,
        email: form.email,
        password: form.password,
      });

      if (response?.error) {
        setAlert({
          isOpen: true,
          type: "error",
          message: response.error || "Invalid email or password.",
        });
        return;
      }

      setAlert({
        isOpen: true,
        type: "success",
        message: "Login successful! Redirecting...",
      });

      // ⚠️ Don’t try to getSession() here — NextAuth updates asynchronously.
      // Let useEffect handle the cart logic once the session is updated.

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
    <div className="min-h-screen flex justify-center items-start bg-[var(--background)] px-4 pt-20 pb-10">
      <div className="mt-5 w-full max-w-md bg-white shadow-lg rounded-2xl p-8 border border-[var(--soft-gray)]">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Welcome Back
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Log in to your account to continue
          </p>
        </div>

        {alert.isOpen && (
          <div className="mb-4">
            <AlertMessage
              type={alert.type as any}
              message={alert.message}
              onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
            />
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2.5"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-md px-4 py-2.5"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-500"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[var(--brand-primary)] text-white py-3 rounded-md font-medium ${
              loading && "opacity-60 cursor-not-allowed"
            }`}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

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
