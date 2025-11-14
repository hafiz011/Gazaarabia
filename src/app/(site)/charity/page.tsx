"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import PaypalModal from "@/components/PaypalModal";
import { charityService } from "@/lib/services/charityService";

// ALERT SYSTEM
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { AlertInterface, PopUpInterface } from "@/lib/types";

// ICONS (Replaces Emoji)
import { Package, HeartPulse, Home, Loader2 } from "lucide-react";

export default function CharityPage() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        amount: "",
        message: "",
        anonymous: false,
    });

    const [loading, setLoading] = useState(false);
    const [paypalOpen, setPaypalOpen] = useState(false);
    const [donationId, setDonationId] = useState<number | null>(null);

    // ALERT STATES (Same as contact page)
    const [alertMessageData, setAlertMessageData] = useState<AlertInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    const [popUpAlertData, setPopUpAlertData] = useState<PopUpInterface>({
        isOpen: false,
        type: "",
        message: "",
    });

    // Submit Donation For Record Creation
    const submitDonation = async (e: any) => {
        e.preventDefault();

        if (!form.email || !form.amount) {
            setPopUpAlertData({
                isOpen: true,
                type: "warning",
                message: "Please fill in all required fields.",
                onConfirm: () =>
                    setPopUpAlertData((prev: any) => ({ ...prev, isOpen: false })),
            });
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: form.name || null,
                email: form.email,
                amount: Number(form.amount),
                message: form.message || null,
                anonymous: form.anonymous,
            };

            const res = await charityService.createDonation(payload);

            if (res.success) {
                setDonationId(res.data.id);
                setPaypalOpen(true);

                setAlertMessageData({
                    isOpen: true,
                    type: "success",
                    message: "Donation created! Please complete payment.",
                });
            } else {
                setAlertMessageData({
                    isOpen: true,
                    type: "error",
                    message: res.message || "Something went wrong.",
                });
            }
        } catch (err: any) {
            setAlertMessageData({
                isOpen: true,
                type: "error",
                message: err.message || "Unexpected error occurred.",
            });
        }

        setLoading(false);
    };

    const handlePaymentSuccess = async (details: any) => {
        if (!donationId) return;

        await charityService.updateDonationAfterPayment(donationId, {
            transactionId: details.id,
        });

        setAlertMessageData({
            isOpen: true,
            type: "success",
            message: "Payment completed successfully! Thank you",
        });

        setForm({
            name: "",
            email: "",
            amount: "",
            message: "",
            anonymous: false,
        });

        setPaypalOpen(false);
    };

    const donationHighlights = [
        {
            title: "Food & Supplies",
            text: "Providing essential meals, hygiene kits, and emergency materials.",
            icon: <Package size={42} className="text-[var(--brand-primary)] mx-auto" />,
        },
        {
            title: "Medical Support",
            text: "Supporting medical care for injured and vulnerable families.",
            icon: <HeartPulse size={42} className="text-[var(--brand-primary)] mx-auto" />,
        },
        {
            title: "Shelter & Recovery",
            text: "Helping rebuild damaged homes and providing safe accommodations.",
            icon: <Home size={42} className="text-[var(--brand-primary)] mx-auto" />,
        },
    ];

    return (
        <div className="w-full bg-white text-[var(--text-primary)]">



            <PopupAlert
                type={popUpAlertData.type as any}
                message={popUpAlertData.message}
                confirmText="OK"
                show={popUpAlertData.isOpen}
                onConfirm={popUpAlertData.onConfirm}
            />

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-24 text-center overflow-hidden">
                <div className="absolute top-0 left-0 w-[38rem] h-[38rem] bg-[var(--brand-secondary)] opacity-20 blur-3xl -translate-x-40 -translate-y-32"></div>
                <div className="absolute bottom-0 right-0 w-[38rem] h-[38rem] bg-[var(--brand-primary)] opacity-20 blur-3xl translate-x-28 translate-y-28"></div>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Gaza Arabia Charity Program
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-base md:text-lg text-white/90 max-w-2xl mx-auto"
                    >
                        Together we contribute to rebuilding lives and supporting humanitarian
                        efforts through verified donations and transparent initiatives.
                    </motion.p>
                </div>
            </section>

            {/* ABOUT SECTION */}
            <section className="py-20 bg-[var(--soft-gray)] relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-[var(--brand-primary)] mb-4">
                            Our Mission
                        </h2>
                        <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
                            Gaza Arabia is committed to supporting families, children, and communities
                            affected by conflict. Every donation is used responsibly and directly for
                            humanitarian aid.
                        </p>
                        <p className="text-[var(--text-secondary)] leading-relaxed">
                            We collaborate with trusted organizations to ensure transparency, and all
                            contributions are fully documented.
                        </p>

                        <Link
                            href="/solidarity-receipts"
                            className="inline-block mt-6 bg-[var(--brand-primary)] text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                        >
                            View Our Contribution Certificates
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="flex justify-center"
                    >
                        <img
                            src="/images/charity/charity-2.png"
                            alt="Charity Support"
                            className="w-full max-w-md max-h-64 object-contain rounded-xl shadow-xl border border-[var(--mid-gray)]"
                        />
                    </motion.div>

                </div>
            </section>

            {/* DONATION HIGHLIGHTS */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-center text-3xl font-bold text-[var(--brand-secondary)] mb-12">
                        How Your Contribution Helps
                    </h2>

                    <div className="grid md:grid-cols-3 gap-10">
                        {donationHighlights.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 }}
                                viewport={{ once: true }}
                                className="bg-[var(--soft-gray)] p-8 rounded-xl shadow hover:shadow-lg border border-[var(--mid-gray)] text-center"
                            >
                                <div className="mb-4">{item.icon}</div>
                                <h3 className="font-semibold text-lg text-[var(--brand-primary)]">{item.title}</h3>
                                <p className="text-[var(--text-secondary)] mt-2">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DONATION FORM */}
            <section className="relative py-20 bg-[var(--soft-gray)] overflow-hidden">

                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="relative z-10 max-w-3xl mx-auto px-6">
                    <div className="bg-white p-10 rounded-2xl shadow-xl border border-[var(--mid-gray)] backdrop-blur-sm">

                        <h2 className="text-3xl font-bold text-center text-[var(--brand-primary)] mb-8">
                            Make a Donation
                        </h2>

                        {/* ALERTS */}
                        {(alertMessageData.isOpen && alertMessageData.type) && (
                            <AlertMessage
                                type={alertMessageData.type}
                                message={alertMessageData.message}
                                onClose={() => setAlertMessageData((prev) => ({ ...prev, isOpen: false }))}
                            />
                        )}

                        <form className="space-y-6" onSubmit={submitDonation}>

                            <div>
                                <label className="text-sm font-medium">Your Name (Optional)</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Donation Amount (GBP) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={form.amount}
                                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg outline-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={form.anonymous}
                                    onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                                />
                                <span className="text-sm">Make my donation anonymous</span>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Message (Optional)</label>
                                <textarea
                                    rows={4}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full px-4 py-3 border rounded-lg outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg text-white font-semibold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] hover:opacity-90 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2" /> Processing...
                                    </>
                                ) : (
                                    "Donate Now"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="relative py-20 text-white text-center bg-gradient-to-r from-[#0B5636] via-[#5E4A42] to-[#B1333A] overflow-hidden">

                <div className="absolute inset-0 bg-black/10 mix-blend-multiply" />

                <div className="relative max-w-3xl mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        Make a Difference Today
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-white/90 mb-8 text-base md:text-lg"
                    >
                        Every contribution counts. Join us in bringing hope to those who need it most.
                    </motion.p>

                    <motion.a
                        whileHover={{ scale: 1.05 }}
                        href="/"
                        className="inline-block bg-white text-[#0B5636] px-8 py-3 rounded-full font-semibold shadow hover:shadow-lg"
                    >
                        Support by Shopping
                    </motion.a>
                </div>
            </section>

            {/* PAYPAL MODAL */}
            <PaypalModal
                open={paypalOpen}
                total={Number(form.amount)}
                onClose={() => setPaypalOpen(false)}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}
