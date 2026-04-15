"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const sections = [
    {
        title: "A. Overview",
        content: `This Agreement describes and provides the terms and conditions (the "Terms") that govern and apply to your participation in GAZAARABIA's ("the Company", "we", "us" or "our") Ambassador Program (the "Program").

You may only participate in the Program if you are eighteen (18) years of age, or older.

You agree that your participation in the Program shall constitute express consent to these Terms.

FAILURE TO COMPLY WITH THESE TERMS WILL RESULT IN IMMEDIATE TERMINATION OF YOUR AMBASSADOR ACCOUNT AND ALL RELATED PRIVILEGES, AS WELL AS FORFEITURE OF ALL UNPAID COMMISSIONS THAT HAVE BEEN EARNED THROUGH YOUR PARTICIPATION IN THE AMBASSADOR PROGRAM.

GAZAARABIA further reserves its right to pursue any and all claims, legal and equitable, that may result from any violation of these Terms.

GAZAARABIA expressly reserves the right to modify these Terms at any time, with or without notice to you. Your continued participation in the Program following any such change shall constitute and evidence your agreement to any such modification to these Terms.

To contact us about any of the matters addressed in these Terms, including to ask questions or to provide comments about these Terms, you may contact us by email at info@gazaarabia.com.`,
    },
    {
        title: "B. Your Ambassador Link and Commission",
        content: `Upon acceptance into the Program, you will be provided with a unique tracking link (your "Ambassador Link"). You will earn a commission on qualifying purchases made through your Ambassador Link, at the rate communicated to you upon joining.

– Commission rates are subject to change at the Company's discretion with reasonable notice.
– Commissions are calculated on the net sale amount, excluding taxes, shipping, and any applied discounts.
– Commissions are paid out on a schedule communicated to active ambassadors.
– GAZAARABIA reserves the right to withhold payment for fraudulent or ineligible referrals.`,
    },
    {
        title: "C. Permitted Uses of Your Ambassador Link",
        content: `You may share your Ambassador Link through the following approved channels:

– Your personal social media accounts (Instagram, TikTok, YouTube, Pinterest, Facebook, Snapchat, etc.)
– Your personal blog or website
– Email newsletters to your own audience (where permitted by applicable law)
– In-person events and word of mouth

When sharing your Ambassador Link, you must clearly disclose your relationship with GAZAARABIA in accordance with applicable advertising standards and FTC / ASA guidelines (e.g., using #ad, #gifted, or #ambassador).`,
    },
    {
        title: "D. Prohibited Uses of Your Ambassador Link",
        content: `You may NOT use your Ambassador Link in the following ways:

– Paid advertising (Google Ads, Meta Ads, TikTok Ads, etc.) without prior written consent from GAZAARABIA
– Coupon, cashback, or deal-aggregator websites
– Spam emails or unsolicited messaging
– Any form of cookie stuffing or automated traffic manipulation
– Placing your link on websites or platforms you do not own or control
– Any activity that violates applicable law or GAZAARABIA's brand guidelines

Violation of these prohibitions will result in immediate termination and forfeiture of unpaid commissions.`,
    },
    {
        title: "E. Representations and Warranties",
        content: `By participating in the Program, you represent and warrant that:

– You are at least 18 years of age.
– You have the legal right and authority to enter into this Agreement.
– All content you create and publish in connection with the Program complies with applicable laws and does not infringe the rights of any third party.
– You will not make false, misleading, or disparaging statements about GAZAARABIA or its products.
– You will comply with all applicable advertising disclosure requirements.`,
    },
    {
        title: "F. Term",
        content: `This Agreement begins when you are accepted into the Program and continues until terminated by either party.

Either party may terminate this Agreement at any time, with or without cause, upon written notice (including email) to the other party. Upon termination:

– Your Ambassador Link will be deactivated.
– Any earned commissions that have cleared the applicable holding period will be paid out; commissions on orders that are later returned or cancelled will be reversed.
– All obligations under sections G (Confidentiality), H (Indemnification), J (Non-Disparagement), and related provisions shall survive termination.`,
    },
    {
        title: "G. Protection of Confidential and Proprietary Information",
        content: `During the Program, you may have access to confidential information belonging to GAZAARABIA, including but not limited to commission rates, product launch details, marketing strategies, and business plans ("Confidential Information").

You agree to:

– Keep all Confidential Information strictly confidential.
– Not disclose Confidential Information to any third party without GAZAARABIA's prior written consent.
– Use Confidential Information solely for the purpose of fulfilling your obligations under this Agreement.

This obligation survives the termination of this Agreement.`,
    },
    {
        title: "H. Indemnification",
        content: `You agree to indemnify, defend, and hold harmless GAZAARABIA, its officers, directors, employees, and agents from and against any claims, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or relating to:

– Your participation in the Program.
– Your violation of these Terms.
– Any content you publish in connection with the Program.
– Any claim that your content infringes the rights of a third party.`,
    },
    {
        title: "I. No Publicity",
        content: `You agree not to issue any press release or make any public announcement regarding your participation in the Program or your relationship with GAZAARABIA without prior written approval from GAZAARABIA.

This includes, but is not limited to, announcing ambassador partnerships on social media before GAZAARABIA has given its authorisation.`,
    },
    {
        title: "J. Non-Disparagement",
        content: `During the term of this Agreement and after its termination, you agree not to make any negative, disparaging, or defamatory statements — whether oral, written, or online — about GAZAARABIA, its products, employees, partners, or brand.

This includes, but is not limited to, posts on social media, reviews, forum comments, or communications with third parties.`,
    },
    {
        title: "K. Miscellaneous",
        content: `– Governing Law: This Agreement shall be governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

– Entire Agreement: This Agreement constitutes the entire agreement between you and GAZAARABIA regarding the Program and supersedes all prior discussions or agreements.

– Severability: If any provision of this Agreement is found to be unenforceable, the remaining provisions shall remain in full force and effect.

– No Waiver: Failure by GAZAARABIA to enforce any right or provision of this Agreement shall not constitute a waiver of that right or provision.

– Assignment: You may not assign or transfer your rights or obligations under this Agreement without GAZAARABIA's prior written consent.`,
    },
];

const faqs = [
    {
        question: "Who can become a GAZAARABIA Ambassador?",
        answer:
            "Anyone aged 18 or older who is passionate about modest fashion and our mission to support the people of Gaza. We welcome creators of all sizes — from nano-influencers to established content creators.",
    },
    {
        question: "How much commission do Ambassadors earn?",
        answer:
            "Ambassadors can earn up to 20% commission on every qualifying sale made through their unique tracking link. Your exact rate will be communicated upon acceptance into the Program.",
    },
    {
        question: "How and when do I get paid?",
        answer:
            "Commissions are paid out on a regular schedule (communicated to active ambassadors upon joining). Payments are processed after orders have cleared the return window to account for any refunds.",
    },
    {
        question: "Can I run paid ads using my Ambassador Link?",
        answer:
            "No. Running paid advertising campaigns (Google Ads, Meta Ads, TikTok Ads, etc.) using your Ambassador Link is prohibited without prior written consent from GAZAARABIA. Violation will result in termination and forfeiture of commissions.",
    },
    {
        question: "Do I need to disclose that I am a paid Ambassador?",
        answer:
            "Yes. You must clearly disclose your relationship with GAZAARABIA whenever you share your Ambassador Link, in accordance with FTC, ASA, and other applicable advertising standards. Use labels like #ad, #ambassador, or #gifted.",
    },
    {
        question: "What happens to my commissions if my account is terminated?",
        answer:
            "Any commissions that have cleared the applicable holding period at the time of termination will be paid out. Commissions on orders that are subsequently returned or cancelled will be reversed. Commissions earned through prohibited activities will be forfeited.",
    },
    {
        question: "Can I share my Ambassador Link on coupon or cashback sites?",
        answer:
            "No. Sharing your Ambassador Link on coupon, cashback, or deal-aggregator websites is strictly prohibited and will result in immediate termination of your account.",
    },
    {
        question: "How do I contact the Ambassador team?",
        answer:
            "You can reach the GAZAARABIA Ambassador team directly by email at info@gazaarabia.com. We aim to respond within 48 hours on business days.",
    },
];

function FAQItem({ faq, index }: { faq: { question: string; answer: string }; index: number }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="border border-[var(--mid-gray)] rounded-xl overflow-hidden bg-white shadow-sm"
        >
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 group"
            >
                <span className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                    {faq.question}
                </span>
                <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-[var(--brand-primary)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <p className="px-6 pb-5 text-[var(--text-secondary)] text-sm leading-relaxed border-t border-[var(--mid-gray)] pt-4">
                            {faq.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function AmbassadorTermsPage() {
    return (
        <div className="w-full bg-white text-[var(--text-primary)]">

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <p className="text-sm uppercase tracking-widest text-white/70 mb-3 font-medium">
                        GAZAARABIA
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Ambassador Program
                    </h1>
                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Terms and Conditions
                    </p>

                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="relative py-20 bg-[var(--soft-gray)] overflow-hidden">
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20" />
                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20" />

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    <div className="space-y-16">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                id={section.title.replace(/\s+/g, "-").toLowerCase()}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.04 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-xl md:text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                                    {section.title}
                                </h3>

                                <p className="text-[var(--text-secondary)] text-base leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>

                                {index !== sections.length - 1 && (
                                    <div className="mt-12 border-b border-[var(--mid-gray)] opacity-30" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ SECTION */}
            <section id="faq" className="py-20 bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20" />
                <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20" />

                <div className="max-w-4xl mx-auto px-6 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <p className="text-xs uppercase tracking-widest text-[var(--brand-primary)] font-semibold mb-3">
                            Got Questions?
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
                            Everything you need to know about the GAZAARABIA Ambassador Program.
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} faq={faq} index={index} />
                        ))}
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-14 flex flex-col items-center gap-4 text-center"
                    >
                        <p className="text-[var(--text-secondary)] text-sm">
                            Still have questions? Reach out to our Ambassador team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href="/affiliate/register"
                                className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition text-base shadow-md"
                            >
                                Apply to the Program
                            </a>
                            <a
                                href="mailto:info@gazaarabia.com?subject=Ambassador%20Program%20Enquiry"
                                className="inline-flex items-center gap-2 border border-[var(--brand-primary)] text-[var(--brand-primary)] font-medium px-8 py-3 rounded-lg hover:bg-[var(--brand-primary)] hover:text-white transition text-base"
                            >
                                ✉ Email Us
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

        </div>
    );
}
