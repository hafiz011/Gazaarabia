"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { authService } from "@/lib/services/authService";
import AlertMessage from "@/components/AlertMessage";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [alert, setAlert] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "";
    message: string;
  }>({
    isOpen: false,
    type: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setAlert({
        isOpen: true,
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    try {
      await authService.signup({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      setAlert({
        isOpen: true,
        type: "success",
        message: "Account created successfully!",
      });
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      router.push("/account");
    } catch (err: any) {
      setAlert({
        isOpen: true,
        type: "error",
        message: err.message || "Something went wrong.",
      });
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-start bg-[var(--background)] px-4 py-10">
      <div className="mt-5 w-full max-w-2xl bg-white shadow-lg rounded-2xl p-10 border border-[var(--soft-gray)] transition-all duration-300 hover:shadow-xl">

        {/* Heading */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">
            Create an Account
          </h1>
          <p className="text-[var(--text-muted)] text-sm">
            Sign up to start shopping with us
          </p>
        </div>

         {/* ✅ Alert Message */}
        {alert.isOpen && alert.type && (
          <AlertMessage
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert((p) => ({ ...p, isOpen: false }))}
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full border border-[var(--soft-gray)] rounded-md px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition"
              required
            />
          </div>

          {/* Email */}
          <div className="col-span-1 md:col-span-2">
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

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full border border-[var(--soft-gray)] rounded-md px-4 py-2.5 text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] focus:outline-none transition"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-10 text-[var(--text-muted)]"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Terms */}
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 accent-[var(--brand-primary)] cursor-pointer"
              required
            />
            <label
              htmlFor="terms"
              className="text-sm text-[var(--text-secondary)] leading-tight cursor-pointer"
            >
              I agree to the{" "}
              <a
                href="#"
                className="text-[var(--brand-primary)] hover:underline font-medium"
              >
                Terms & Conditions
              </a>
            </label>
          </div>

          {/* Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-[var(--brand-primary)] text-white py-3 rounded-md font-medium hover:opacity-90 active:scale-[0.98] transition"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Login Link */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-8">
          Already have an account?{" "}
          <a
            href="/account/login"
            className="text-[var(--brand-primary)] font-medium hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
