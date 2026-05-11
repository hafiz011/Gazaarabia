import Link from "next/link";
import { MoveLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-lg">
        {/* Animated 404 Text */}
        <h1 className="text-9xl font-black text-gray-100 select-none animate-pulse">
          404
        </h1>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-[var(--text-primary)]">
            Oops! Page Not Found
          </h2>
          <p className="text-[var(--text-secondary)] text-lg">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-[var(--brand-primary)] text-white font-semibold rounded-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            <Home size={20} />
            Back to Home
          </Link>
          
          <Link
            href="/shop/all"
            className="flex items-center justify-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 text-[var(--text-primary)] font-semibold rounded-lg hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-all active:scale-95"
          >
            <Search size={20} />
            Shop Collections
          </Link>
        </div>

        {/* Subtle Brand Link */}
        <div className="pt-12">
          <Link 
            href="/" 
            className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-[var(--brand-primary)] transition-colors"
          >
            Gazaarabia
          </Link>
        </div>
      </div>
    </div>
  );
}
