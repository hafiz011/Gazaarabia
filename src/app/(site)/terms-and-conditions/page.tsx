"use client";

import { motion } from "framer-motion";

export default function TermsAndConditionsPage() {
    return (
        <div className="w-full bg-white text-[var(--text-primary)]">
            {/* HERO */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Terms & Conditions
                    </h1>
                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        Please review the terms carefully before using our website or services.
                    </p>
                </div>
            </section>

            {/* CONTENT */}
            <section className="relative py-16 bg-[var(--soft-gray)] overflow-hidden">
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] bg-[var(--brand-secondary)] opacity-10 blur-3xl -translate-x-40 -translate-y-20"></div>
                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] bg-[var(--brand-primary)] opacity-10 blur-3xl translate-x-20 translate-y-20"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10">
                    {/* Intro */}
                    <div className="text-center mb-12">
                        <h2 className="text-2xl md:text-3xl font-semibold text-[var(--brand-primary)] mb-3">
                            Our Legal Agreement with You
                        </h2>
                        <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
                            These updated Terms & Conditions outline your rights and obligations when using our services.
                        </p>
                    </div>

                    {/* 1. Use of Website */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            1. Use of the Website
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the service,
                            use of the service, or access to the service or any contact on the website through which the service
                            is provided, without express written permission by us.
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 2. Products and Orders */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            2. Products and Orders
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            <b>2.1 Product Description</b>
                            {`
a. We strive to ensure that all descriptions, photographs, and prices of products appearing on the Website are accurate. However, errors may occur. If we discover an error in the price or description of any product you have ordered, we will inform you as soon as possible and give you the option of reconfirming your order at the correct price or cancelling it.
b. Colour and Design Variation: The actual colours and designs of the products may vary slightly from the images shown online due to photographic lighting sources or your monitor settings.
c. All products are subject to availability.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 3. Order Acceptance */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            3. Order Acceptance
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            {`a. Your order will be considered as fulfilled when we send you an Order Confirmation Email, confirming that the goods have been dispatched. The acceptance of your order and the completion of the order will take place on the dispatch of the products ordered, unless we have notified you that we do not accept your order, or you have cancelled it.
b. We reserve the right to refuse any order you place with us.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 4. Price and Payment */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            4. Price and Payment
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            {`a. All prices displayed on the Website are in Great British Pounds (£) and include Value Added Tax (VAT) at the current UK rate (usually 20%, unless stated otherwise), where applicable.
b. Prices do not include delivery charges, which will be added to the total amount due at checkout if the amount is lesser than the minimum for free delivery as stated on the website.
c. We accept payment via Visa, Mastercard, PayPal, and other supported payment methods.
d. You confirm that the credit/debit card or other payment method being used is yours. All cardholders are subject to validation checks and authorisation by the card issuer.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 5. Delivery */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            5. Delivery
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            {`a. We currently deliver to United Kingdom and rest of the world.
b. Estimated delivery times are provided at checkout and are subject to change. Time for delivery shall not be of the essence.
c. Risk of loss and damage to products passes to you upon delivery.
d. If your order is returned to us due to an incorrect address provided by you, or failure to collect the package, you may be liable for the redelivery costs.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 6. Cancellation Rights */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            6. Your Right to Cancel (UK Consumer Contracts Regulations 2013)
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            <b>6.1 Cancellation Period</b>
                            {`
a. As a consumer in the UK, you have the right to cancel your order and receive a full refund, including standard delivery costs (if applicable), under the Consumer Contracts Regulations 2013.
b. The cancellation period ends 14 days after the day on which you (or a person nominated by you) receives the goods.
`}
                            <b>6.2 Exercise of the Right to Cancel</b>
                            {`
                            a. To exercise the right to cancel, you must inform us of your decision by an email.
b. You must return the goods to us at your own expense within 14 days of informing us of the cancellation.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 7. Returns & Refunds */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            7. Returns and Refunds (Consumer Rights Act 2015)
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            <b>7.1 Faulty Goods</b>
                            {`
a. If the products we deliver are faulty, damaged, or not as described, you should notify us promptly.
b. We will offer a refund, repair, or replacement in accordance with your legal rights under the Consumer Rights Act 2015.

`}
                            <b>7.2 Non-Faulty Goods (Change of Mind)</b>

                            {`
a. In addition to your right to cancel (Section 6), we accept returns for non-faulty goods provided they meet the following conditions:
i. The item is returned within 14 days from the date of delivery.
ii. The item is unworn, unwashed, unused, and in its original condition with all tags and labels still attached.
iii. The item is returned in its original packaging.
b. The cost of returning non-faulty goods is your responsibility.
`}

                            <b>7.3 Processing Refunds</b>
                            {`
a. We will process the refund due to you as soon as possible and, in any case, within 14 days of the day we receive the returned goods or (if earlier) the day you provide evidence that you have returned the goods.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 8. Intellectual Property */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            8. Intellectual Property
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            {`a. The entire content of the Website, including but not limited to text, graphics, logos, images, audio clips, and software, is the property of Gazaarabia or its content suppliers and is protected by UK and international copyright laws.
b. You may not systematically extract and/or re-utilize parts of the contents of the Website without our express written consent.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 9. Limitation of Liability */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            9. Limitation of Liability
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            {`a. Nothing in these Terms limits or excludes our liability for:
(i) death or personal injury caused by our negligence;
(ii) fraud or fraudulent misrepresentation; or
(iii) any matter for which it would be illegal for us to exclude, or attempt to exclude, our liability.

b. Subject to the preceding clause, our total liability to you in respect of all losses arising under or in connection with the contract shall be limited to the total price of the products purchased.`}
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 10. Governing Law */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            10. Governing Law and Jurisdiction
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            These Terms shall be governed by and construed in accordance with the laws of England and Wales.
                            Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the courts of
                            England and Wales.
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 11. Changes to Terms */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            11. Changes to Terms
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            We reserve the right to change these Terms at any time. Any changes will be posted on this
                            page with an updated "Last updated" date. Your continued use of the Website after any such
                            changes constitutes your acceptance of the new Terms.
                        </p>
                        <div className="mt-10 border-b border-[var(--mid-gray)] opacity-20"></div>
                    </motion.div>

                    {/* 12. Contact Information */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.55 }}>
                        <h3 className="text-lg md:text-xl font-semibold text-[var(--brand-primary)] mb-3">
                            12. Contact Information
                        </h3>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            For any queries regarding these Terms, please contact our Legal Team.
                        </p>

                        <div className="mt-6 flex justify-center">
                            <a
                                href="mailto:legal@gazaarabia.com"
                                className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition text-base"
                            >
                                Contact Our Legal Team
                            </a>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <div className="mt-16 pt-6 border-t border-[var(--mid-gray)] text-center text-sm text-[var(--text-muted)]">
                        <p> &copy; {new Date().getFullYear()} Gazaarabia. All rights reserved.</p>
                        <p className="mt-1">Last Updated: December 2025</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
