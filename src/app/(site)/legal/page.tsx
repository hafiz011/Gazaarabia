"use client";

export default function LegalHubPage() {
    return (
        <div className="w-full bg-[var(--soft-gray)] min-h-screen py-20">
            <div className="max-w-4xl mx-auto px-6">

                {/* PAGE TITLE */}
                <h1 className="text-3xl md:text-4xl font-semibold text-[var(--brand-primary)] mb-8">
                    Legal & Privacy
                </h1>

                <p className="text-[var(--text-secondary)] text-base md:text-lg max-w-2xl mb-12 leading-relaxed">
                    Find all legal information about how GAZAARABIA protects your privacy, handles data,
                    uses cookies, and manages orders, returns and customer rights.
                </p>

                {/* LINKS LIST */}
                <div className="space-y-6">

                    {/* Privacy Policy */}
                    <a
                        href="/privacy-policy"
                        className="block bg-white p-6 rounded-xl border border-[var(--mid-gray)]/30 hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Privacy Policy</h2>
                        <p className="text-[var(--text-secondary)] mt-1 text-sm">
                            How we collect, use and protect your personal data.
                        </p>
                    </a>

                    {/* Cookies Policy */}
                    <a
                        href="/cookies-policy"
                        target="_blank"
                        className="block bg-white p-6 rounded-xl border border-[var(--mid-gray)]/30 hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Cookies Policy</h2>
                        <p className="text-[var(--text-secondary)] mt-1 text-sm">
                            Details about how cookies and tracking technologies are used on our site.
                        </p>
                    </a>

                    {/* Returns & Exchanges */}
                    <a
                        href="/returns-exchanges"
                        className="block bg-white p-6 rounded-xl border border-[var(--mid-gray)]/30 hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Returns & Exchanges</h2>
                        <p className="text-[var(--text-secondary)] mt-1 text-sm">
                            Everything you need to know about returning or exchanging items.
                        </p>
                    </a>

                    {/* Terms & Conditions (Optional) */}
                    <a
                        href="/terms"
                        className="block bg-white p-6 rounded-xl border border-[var(--mid-gray)]/30 hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold text-[var(--brand-primary)]">Terms & Conditions</h2>
                        <p className="text-[var(--text-secondary)] mt-1 text-sm">
                            General terms for using our website and placing orders.
                        </p>
                    </a>

                </div>
            </div>
        </div>
    );
}
