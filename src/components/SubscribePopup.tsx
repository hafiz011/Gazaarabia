"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { subscriberService } from "@/lib/services/front-end/subscriberService";

export default function SubscribePopup() {
    const [show, setShow] = useState<boolean>(false);
    const [step, setStep] = useState<number>(1);

    const [email, setEmail] = useState<string>("");
    const [fullName, setFullName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");

    const [emailError, setEmailError] = useState<string>("");
    const [finalError, setFinalError] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false); //  NEW

    // useEffect(() => {
    //     const seen = localStorage.getItem("subscribeShown");
    //     if (!seen) {
    //         setTimeout(() => setShow(true), 1200);
    //     }
    // }, []);

    useEffect(() => {
        const seen = localStorage.getItem("subscribeShown");

        if (seen) {
            const expiry = parseInt(seen, 10);
            if (Date.now() < expiry) return;  // Within 30 days → do not show
        }

        setTimeout(() => setShow(true), 1200);
    }, []);


    // Step 1: Email Submit
    const handleEmailSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setEmailError("");
        setLoading(true); //  Disable button

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            setEmailError("Please enter a valid email address.");
            setLoading(false);
            return;
        }

        try {
            await subscriberService.start(email);
            setStep(2);
        } catch {
            setEmailError("Failed to start subscribe. Try again.");
        }

        setLoading(false);
    };

    // Step 2: Final submit
    const handleFinalSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFinalError("");
        setLoading(true); //  Disable button

        if (!fullName.trim() || !phone.trim()) {
            setFinalError("Please fill in all fields.");
            setLoading(false);
            return;
        }

        try {
            await subscriberService.complete(email, fullName, phone);
            const expiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
            localStorage.setItem("subscribeShown", expiryDate.toString());
            setShow(false);

        } catch {
            setFinalError("subscribe failed. Please try again.");
        }

        setLoading(false);
    };

    if (!show) return null;

    return (
        <div style={styles.overlay}>
            <div style={styles.popup}>

                {/* Close button */}
                <button style={styles.closeBtn}
                    onClick={() => {
                        const expiryDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
                        localStorage.setItem("subscribeShown", expiryDate.toString());
                        setShow(false);
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="var(--dark-gray)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2 style={styles.title}>Subscribe to Our Updates</h2>
                <p style={styles.subtitle}>
                    Get exclusive offers, new arrivals and early access.
                </p>

                {/* Step 1 */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                        <input
                            style={styles.input}
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                        {emailError && <p style={styles.errorText}>{emailError}</p>}

                        <button
                            style={{
                                ...styles.primaryBtn,
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? "Please wait..." : "Continue"}
                        </button>
                    </form>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <form onSubmit={handleFinalSubmit}>
                        <input
                            style={styles.input}
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setFullName(e.target.value)
                            }
                            required
                        />

                        <input
                            style={styles.input}
                            type="tel"
                            placeholder="Phone Number"
                            value={phone}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setPhone(e.target.value)
                            }
                            required
                        />

                        {finalError && <p style={styles.errorText}>{finalError}</p>}

                        <button
                            style={{
                                ...styles.primaryBtn,
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                            disabled={loading}
                            type="submit"
                        >
                            {loading ? "Submitting..." : "Subscribe"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
    },
    popup: {
        width: "90%",
        maxWidth: "420px",
        background: "var(--white)",
        padding: "30px",
        borderRadius: "14px",
        position: "relative",
        boxShadow: "0 8px 35px rgba(0,0,0,0.20)",
    },
    closeBtn: {
        position: "absolute",
        top: "12px",
        right: "12px",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "4px",
    },
    title: {
        margin: "0 0 10px",
        fontSize: "22px",
        color: "var(--text-primary)",
        fontWeight: 700,
    },
    subtitle: {
        margin: "0 0 20px",
        fontSize: "14px",
        color: "var(--text-secondary)",
    },
    input: {
        width: "100%",
        padding: "12px 14px",
        marginBottom: "10px",
        borderRadius: "8px",
        border: "1px solid var(--soft-gray)",
        fontSize: "15px",
    },
    primaryBtn: {
        width: "100%",
        padding: "12px",
        background: "var(--btn-primary)",
        color: "var(--white)",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: 600,
        marginTop: "5px",
    },
    errorText: {
        color: "var(--brand-primary)",
        fontSize: "13px",
        marginBottom: "6px",
    },
};
