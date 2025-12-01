"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import React, { useState } from "react";

import PaypalModal from "@/components/PaypalModal";
import { charityService } from "@/lib/services/front-end/charityService";

// ALERT SYSTEM
import AlertMessage from "@/components/AlertMessage";
import PopupAlert from "@/components/PopupAlert";
import { AlertInterface, PopUpInterface } from "@/lib/types";

// ICONS
import {
    Package,
    HeartPulse,
    Home,
    Loader2,
    Target,
    ShieldCheck,
    HandCoins,
    Handshake,
    ScrollText,
    BadgeCheck,
} from "lucide-react";

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

    // ALERT STATES
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

    // SECTION HEADING COMPONENT
    // - Keeps heading left-aligned
    // - Icon shown beside first row
    // - Underline width follows heading text (uses inline-block)
    const SectionHeading = ({ title, Icon }: { title: string; Icon: any }) => (
        <div className="mb-6 text-left">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                    <Icon
                        size={40}
                        className="text-[var(--brand-primary)]"
                    />
                </div>

                <h2 className="text-[1.6rem] md:text-[1.95rem] font-semibold tracking-tight bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent inline-block">
                    {title}
                </h2>
            </div>

            {/* Underline: inline-block so its width follows the heading text */}
            {/* margin-left approximates icon + gap so underline sits under the heading text */}
            <div className="mt-2 ml-[56px]">
                <span className="inline-block h-[3px] rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]" style={{ width: "fit-content", minWidth: "40px", paddingInline: "0.5rem" }} />
            </div>
        </div>
    );

    // SUBMIT DONATION
    const submitDonation = async (e: any) => {
        e.preventDefault();
        if (!form.email || !form.amount) {
            setPopUpAlertData({
                isOpen: true,
                type: "warning",
                message: "Please fill in all required fields.",
                onConfirm: () =>
                    setPopUpAlertData((prev: any) => ({
                        ...prev,
                        isOpen: false,
                    })),
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

    // AFTER PAYMENT SUCCESS
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

    // ================= YOUR PROVIDED CONTENT (ZERO EDITS) =================
    // We'll render your long text exactly as supplied inside structured blocks.

    const missionHtml = (
        <>
            <SectionHeading title="OUR MISSION & CHARITY PARTNERS" Icon={Target} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-4">
                <p>
                    Modest Fashion with PURPOSE.
                </p>

                <p>
                    GAZAARABIA was created from the pain, beauty and resilience of Gaza and Palestine – that’s our core inspiration, our story and our aesthetic.
                    But our responsibility doesn’t stop at one place.
                </p>

                <p>
                    Our mission is to:
                </p>

                <ul className="list-disc ml-6 space-y-1">
                    <li>Design modest, meaningful clothing, and</li>
                    <li>Use the majority of our profit to support people in Gaza, Palestine and crisis-affected communities around the world.</li>
                </ul>

                <p>
                    Whenever there is a genuine need, we want GazaArabia to show up.
                </p>
            </div>
        </>
    );

    const brandNotCharityHtml = (
        <>
            <SectionHeading title="We’re a Brand, Not a Charity" Icon={ShieldCheck} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                    GAZAARABIA is a for-profit modest fashion brand, not a registered charity.
                </p>

                <p>
                    We want this to be crystal clear:
                </p>

                <ul className="list-disc ml-6 space-y-1">
                    <li>When you buy from us, you are purchasing products, not making a direct donation</li>
                    <li>We choose to donate the majority of our net profit to humanitarian and community projects</li>
                    <li>Gaza and Palestine are our core focus and inspiration, but we will also support other regions in crisis when they need us</li>
                </ul>

                <p>
                    This model lets us build something sustainable, so support continues even when social media moves on.
                </p>
            </div>
        </>
    );

    const whoWeWorkWithHtml = (
        <>
            <SectionHeading title="Who We Work With" Icon={Handshake} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                    We aim to work with trusted organisations and initiatives such as:
                </p>

                <ul className="list-disc ml-6 space-y-1">
                    <li>Palestine Solidarity Campaign (PSC) – campaigning for justice and human rights for Palestinians</li>
                    <li>Al Khair Foundation – delivering humanitarian aid and long-term development in crisis regions, including Gaza</li>
                    <li>Islamic Relief UK – providing emergency relief and development programmes for people in need worldwide, including Palestine</li>
                    <li>The MAT Project – a community-driven initiative we support to help deliver real, practical assistance on the ground</li>
                </ul>

                <p>
                    As GazaArabia grows, we may also support other reputable organisations working in different countries facing conflict, disaster or extreme hardship – while still keeping Gaza and Palestine as our core priority.
                </p>
            </div>
        </>
    );

    const howOrderBecomesSupportHtml = (
        <>
            <SectionHeading title="How Your Order Becomes Support" Icon={HandCoins} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                    When you shop with GazaArabia:
                </p>

                <ol className="list-decimal ml-6 space-y-1">
                    <li>
                        You choose your pieces
                        <div className="ml-4">You buy abayas, thobes and modest wear you love.</div>
                    </li>
                    <li>
                        We cover our business costs
                        <div className="ml-4">from each order; we pay for production, shipping, staff, tech and operations.</div>
                    </li>
                    <li>
                        We donate the majority of our profit
                        <div className="ml-4">After costs, we commit to donating the majority of our net profit to our charity and community partners – focused first on Gaza & Palestine, and then wider global crises.</div>
                    </li>
                    <li>
                        Partners turn funds into action
                        <div className="ml-4">Depending on the project, your purchase can help fund:
                            <ul className="list-disc ml-6 mt-2">
                                <li>Food, water and medical support</li>
                                <li>Shelter and essentials for displaced families</li>
                                <li>Education and community projects</li>
                                <li>Campaigns and advocacy for justice and human rights</li>
                            </ul>
                        </div>
                    </li>
                </ol>
            </div>
        </>
    );

    const solidarityReceiptsHtml = (
        <>
            <SectionHeading title="Solidarity Receipts: See Every Donation" Icon={ScrollText} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                    We don’t want you to just “take our word for it”.
                    We will host a dedicated “Solidarity Receipts” page on our website where you can see:
                </p>

                <ul className="list-disc ml-6 space-y-1">
                    <li>Each donation we make</li>
                    <li>The date, amount and currency</li>
                    <li>The organisation or project it went to (PSC, Al Khair Foundation, Islamic Relief UK, The MAT Project, etc.)</li>
                    <li>A certificate, receipt or confirmation document from that organisation</li>
                </ul>

                <p>
                    You’ll be able to scroll through our Solidarity Receipts and see how GazaArabia’s community has contributed over time – for Gaza, Palestine, and other parts of the world that needed support.
                </p>

                <Link href="/solidarity-receipts" className="inline-block mt-2 underline text-[var(--brand-primary)]">
                    View Solidarity Receipts
                </Link>
            </div>
        </>
    );

    const gazaCoreHtml = (
        <>
            <SectionHeading title="Gaza is Our Core. The World is Our Responsibility." Icon={BadgeCheck} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                    Gaza and Palestine are:
                </p>

                <ul className="list-disc ml-6 space-y-1">
                    <li>Our visual inspiration</li>
                    <li>Our emotional starting point</li>
                    <li>The reason this brand exists</li>
                </ul>

                <p>
                    But the values behind GazaArabia – justice, dignity, compassion, solidarity – are universal.
                    So while Gaza remains at the centre of our work and giving, we are also ready to stand with other oppressed and struggling communities worldwide whenever we can.
                </p>
            </div>
        </>
    );

    const ourPromiseHtml = (
        <>
            <SectionHeading title="Our Promise" Icon={BadgeCheck} />
            <div className="text-[var(--text-secondary)] leading-relaxed space-y-3">
                <p>
                    As GazaArabia grows, we promise to:
                </p>
                <ul className="list-disc ml-6 space-y-1">
                    <li>Keep Gaza and Palestine at the heart of our story and impact</li>
                    <li>Keep supporting global humanitarian causes where the need is real and urgent</li>
                    <li>Keep improving our transparency, with Solidarity Receipts and regular updates</li>
                    <li>Make sure that what you wear doesn’t just look good – it does good, for Gaza and beyond</li>
                </ul>

                <p>
                    Thank you for standing with us.
                    Every outfit is a small act of global solidarity, rooted in Gaza.
                </p>
            </div>
        </>
    );

    // Donation highlights (icons larger on mobile via tailwind classes)
    const donationHighlights = [
        {
            title: "Food, water and medical support",
            text: "Food, water and medical support",
            icon: <Package size={54} className="mx-auto text-[var(--brand-primary)]" />,
        },
        {
            title: "Shelter and essentials for displaced families",
            text: "Shelter and essentials for displaced families",
            icon: <Home size={54} className="mx-auto text-[var(--brand-primary)]" />,
        },
        {
            title: "Education and community projects",
            text: "Education and community projects",
            icon: <HeartPulse size={54} className="mx-auto text-[var(--brand-primary)]" />,
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

            {/* HERO */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 md:py-24 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-3xl md:text-5xl font-bold mb-4">
                        Gazaarabia Charity & Mission
                    </motion.h1>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
                        Together we contribute to rebuilding lives and supporting humanitarian efforts through verified donations and transparent initiatives.
                    </motion.p>
                </div>
            </section>

            {/* CONTENT */}
            <section className="py-12 md:py-16 bg-[var(--soft-gray)]">
                <div className="max-w-6xl mx-auto px-6 grid gap-8">
                    <div className="bg-white p-6 md:p-8 rounded-xl shadow border border-[var(--mid-gray)]">
                        {missionHtml}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow border border-[var(--mid-gray)]">
                            {brandNotCharityHtml}
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow border border-[var(--mid-gray)]">
                            {whoWeWorkWithHtml}
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border border-[var(--mid-gray)]">
                        {howOrderBecomesSupportHtml}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border border-[var(--mid-gray)]">
                        {solidarityReceiptsHtml}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border border-[var(--mid-gray)]">
                        {gazaCoreHtml}
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow border border-[var(--mid-gray)]">
                        {ourPromiseHtml}
                    </div>
                </div>
            </section>

            {/* DONATION HIGHLIGHTS */}
            <section className="py-12 md:py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-center text-2xl md:text-3xl font-bold text-[var(--brand-secondary)] mb-6">Solidarity Projects</h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {donationHighlights.map((it, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.08 }} className="bg-[var(--soft-gray)] p-6 md:p-8 rounded-xl shadow border border-[var(--mid-gray)] text-center">
                                <div className="mb-4">{it.icon}</div>
                                <h3 className="font-semibold text-lg text-[var(--brand-primary)]">{it.title}</h3>
                                <p className="text-[var(--text-secondary)] mt-2">{it.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DONATION FORM */}
            <section className="py-12 md:py-16 bg-[var(--soft-gray)]">
                <div className="max-w-3xl mx-auto px-6">
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-[var(--mid-gray)]">
                        <h2 className="text-2xl md:text-3xl font-bold text-center text-[var(--brand-primary)] mb-4">Make a Donation</h2>

                        {(alertMessageData.isOpen && alertMessageData.type) && (
                            <AlertMessage type={alertMessageData.type} message={alertMessageData.message} onClose={() => setAlertMessageData((prev) => ({ ...prev, isOpen: false }))} />
                        )}

                        <form className="space-y-4" onSubmit={submitDonation}>
                            <div>
                                <label className="text-sm font-medium">Your Name (Optional)</label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border rounded-lg outline-none" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Email Address *</label>
                                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border rounded-lg outline-none" />
                            </div>

                            <div>
                                <label className="text-sm font-medium">Donation Amount (GBP) *</label>
                                <input type="number" min="1" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full px-4 py-3 border rounded-lg outline-none" />
                            </div>

                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} />
                                <span className="text-sm">Make my donation anonymous</span>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Message (Optional)</label>
                                <textarea rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 border rounded-lg outline-none" />
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

            {/* CTA */}
            <section className="py-12 md:py-16 text-white text-center bg-gradient-to-r from-[#0B5636] via-[#5E4A42] to-[#B1333A]">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-2xl md:text-3xl font-bold mb-4">
                        Make a Difference Today
                    </motion.h2>

                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-white/90 mb-6 text-base md:text-lg">
                        Every contribution counts. Join us in bringing hope to those who need it most.
                    </motion.p>

                    <motion.a whileHover={{ scale: 1.05 }} href="/" className="inline-block bg-white text-[#0B5636] px-6 md:px-8 py-2 md:py-3 rounded-full font-semibold shadow hover:shadow-lg">
                        Support by Shopping
                    </motion.a>
                </div>
            </section>

            {/* PAYPAL MODAL */}
            <PaypalModal open={paypalOpen} total={Number(form.amount)} onClose={() => setPaypalOpen(false)} onSuccess={handlePaymentSuccess} />
        </div>
    );
}
