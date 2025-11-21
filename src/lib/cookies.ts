export type CookieConsent = {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
};

export function getCookieConsent(): CookieConsent | null {
    if (typeof window === "undefined") return null;

    const stored = localStorage.getItem("cookieConsent");
    if (!stored) return null;

    // --- Fix legacy string values ("accepted", "rejected") ---
    if (stored === "accepted") {
        return {
            necessary: true,
            analytics: true,
            marketing: true,
        };
    }

    if (stored === "rejected") {
        return {
            necessary: true,
            analytics: false,
            marketing: false,
        };
    }

    // --- Safe JSON parsing (avoid crashes) ---
    try {
        return JSON.parse(stored) as CookieConsent;
    } catch (err) {
        console.warn("Invalid cookieConsent JSON:", err);
        return null;
    }
}

export function setCookieConsent(consent: CookieConsent): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("cookieConsent", JSON.stringify(consent));
}
