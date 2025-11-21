"use client";

import { useEffect, useState } from "react";
import { getCookieConsent, setCookieConsent } from "@/lib/cookies";
import CookiePreferencesModal from "./CookiePreferencesModal";
import { usePathname } from "next/navigation";

export default function CookieConsentModal() {
    const [open, setOpen] = useState<boolean>(false);
    const [preferencesOpen, setPreferencesOpen] = useState<boolean>(false);

    const pathname = usePathname();

    // Pages where cookie popup should NOT show
    const excludedPages = [
        "/cookies-policy",
        "/privacy-policy",
        "/returns-exchanges",
        "/terms-and-conditions",
    ];

    useEffect(() => {
        const consent = getCookieConsent();
        if (!consent) {
            setOpen(true);
            document.body.style.overflow = "hidden";
        }
    }, []);

    const acceptAll = () => {
        setCookieConsent({ necessary: true, analytics: true, marketing: true });
        setOpen(false);
        setPreferencesOpen(false);   // NEW
        document.body.style.overflow = "";
    };


    const rejectNonEssential = () => {
        setCookieConsent({ necessary: true, analytics: false, marketing: false });
        setOpen(false);
        setPreferencesOpen(false);   // NEW
        document.body.style.overflow = "";
    };


    if (excludedPages.includes(pathname)) {
        return null;
    }


    if (!open) return null;

    return (
        <>
            {/* DARK BACKDROP */}
            <div className="fixed inset-0 bg-black/60 z-[9998]" />

            {/* COOKIE POPUP */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] px-4">
                <div className="bg-white w-full max-w-2xl p-10 rounded-xl shadow-xl">

                    <h2 className="text-center text-xl font-semibold">
                        OUR SITE USES COOKIES
                    </h2>

                    <p className="mt-4 text-[var(--text-secondary)] leading-relaxed">
                        Cookies help us to ensure our site works securely, continually make
                        improvements, and personalise your shopping experience.
                    </p>

                    <p className="mt-4 text-[var(--text-secondary)]">
                        For more information, please see our{" "}
                        <a
                            href="/cookies-policy"
                            target="_blank"
                            className="text-[var(--brand-primary)] underline font-medium"
                        >
                            Privacy & Cookie Policy
                        </a>.
                    </p>

                    {/* BUTTONS */}
                    <div className="mt-8 flex flex-col gap-4">

                        <button
                            onClick={acceptAll}
                            className="w-full py-3 bg-[var(--brand-primary)] text-white font-semibold rounded-md"
                        >
                            ACCEPT ALL COOKIES
                        </button>

                        <button
                            onClick={rejectNonEssential}
                            className="w-full py-3 bg-black text-white font-semibold rounded-md"
                        >
                            REJECT NON-ESSENTIAL COOKIES
                        </button>

                        <button
                            onClick={() => {
                                setPreferencesOpen(true);
                            }}
                            className="w-full text-center mt-2 underline text-[var(--brand-primary)] font-medium"
                        >
                            MANUALLY MANAGE COOKIES
                        </button>


                    </div>
                </div>
            </div>

            {preferencesOpen && (
                <CookiePreferencesModal

                    onClose={() => {
                        setOpen(false);
                        setPreferencesOpen(false);
                        document.body.style.overflow = "";
                    }}


                />
            )}
        </>
    );
}
