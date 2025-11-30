"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-6 py-10">

            <div
                className="
          w-full max-w-lg bg-white/90 backdrop-blur-lg 
          rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.08)]
          border border-neutral-200 p-12 
          animate-enterCard
        "
            >
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="p-6 bg-red-50 rounded-full border border-red-100 shadow-sm animate-iconPop">
                        <ShieldAlert className="h-14 w-14 text-red-600 animate-iconPulse" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="mt-8 text-3xl font-bold text-neutral-900 text-center tracking-tight animate-fadeIn delay-150">
                    Access Restricted
                </h1>

                {/* Subtext */}
                <p className="mt-4 text-neutral-600 text-center leading-relaxed animate-fadeIn delay-200">
                    You don't have permission to view this page.
                    Make sure you're signed in with the correct account or contact support.
                </p>

                {/* Divider */}
                <div className="my-10 border-t border-neutral-200 animate-fadeIn delay-300"></div>

                {/* CTA Buttons */}
                <div className="space-y-4 animate-fadeIn delay-300">

                    <Link
                        href="/"
                        className="
              block w-full text-center py-3.5 rounded-lg 
              bg-neutral-900 text-white font-medium tracking-wide 
              hover:bg-neutral-800 transition-all duration-200 
              hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]
            "
                    >
                        Return to Homepage
                    </Link>

                    {/* <Link
                        href="/login"
                        className="
              block w-full text-center py-3.5 rounded-lg 
              border border-neutral-300 text-neutral-700 font-medium
              hover:bg-neutral-100 transition-all duration-200
            "
                    >
                        Login with a different account
                    </Link> */}

                </div>

                {/* Footer Note */}
                <p className="mt-10 text-center text-neutral-500 text-sm animate-fadeIn delay-500">
                    Need help? Contact your system administrator.
                </p>
            </div>
        </div>
    );
}
