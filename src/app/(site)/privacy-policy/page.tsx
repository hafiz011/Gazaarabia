"use client";

import { motion } from "framer-motion";

export default function PrivacyPolicyPage() {
    const sections = [
        {
            title: "1. Who we are",
            content: `
GAZAARABIA (“we”, “us”, “our”) is a modest fashion brand based in London, UK, focused on abayas, thobes, Kaftans, and Palestine-inspired clothing.
We are the data controller of the personal data we collect about you.

* Business name: GAZAARABIA
* Email: info@gazaarabia.com
* Registered address: 38A Tachbrook street, SW1V 2JS

If you have any questions about this Policy or how we use your data, you can contact us at:
info@gazaarabia.com
            `,
        },
        {
            title: "2. What data we collect",
            content: `
We collect and process the following types of personal data:

a) When you browse our website
* IP address
* Device type and browser type
* Approximate location
* Pages visited, clicks, time spent on pages
* Cookies and similar tracking technologies (see our Cookies Policy)

b) When you create an account or place an order
* Full name
* Email address
* Phone number (if provided)
* Shipping and billing address
* Order details (products purchased, dates, amounts)
* Payment method details (processed by our payment providers – we do not see your full card number)

c) When you join our newsletter or marketing list
* Name
* Email address
* Marketing preferences (e.g. email, SMS, WhatsApp – if enabled)

d) When you apply to be an ambassador / influencer
* Name
* Email and social media handles
* Country
* Links to social media profiles
* Any information you share in your application (e.g. about you, your content, your audience)

e) When you contact us
* Name and contact details
* Content of messages (emails, chat, DMs, forms)
* Any other information you choose to share
            `,
        },
        {
            title: "3. How we use your data (and legal basis)",
            content: `
We process your personal data under the UK GDPR / EU GDPR on the following bases:

1. To process your orders and deliver products
    * To take payment, provide invoices and send order confirmations
    * To ship your order and handle returns or exchanges
Legal basis: Performance of a contract

2. To provide customer support
    * Answer questions, handle complaints or enquiries
Legal basis: Performance of a contract / Legitimate interests

3. To create and manage your account
    * Let you log in, view orders, save addresses
Legal basis: Performance of a contract / Legitimate interests

4. For marketing and communications
    * Send you news, offers, product launches, campaign stories and updates about Gaza/charity impact
Legal basis: Consent (for email/SMS marketing where required) / Legitimate interests
You can opt out at any time by clicking “unsubscribe” or contacting us.

5. For ambassador & influencer programmes
    * Review applications, manage relationships, track performance and pay commission
Legal basis: Performance of a contract / Legitimate interests / Consent (where relevant)

6. To improve our website and products
    * Analyse how visitors use the site
    * Understand what content and products perform best
Legal basis: Legitimate interests (to run and grow our business), and consent for non-essential cookies.

7. To comply with legal obligations
    * Accounting, tax, fraud prevention, law enforcement requests
Legal basis: Legal obligation
            `,
        },
        {
            title: "4. Sharing your data",
            content: `
We do not sell your personal data.

We may share your data with trusted third parties who help us run our business, such as:

* Payment providers (e.g. Stripe, PayPal, Klarna, Apple Pay – depending on what we use)
* Website hosting and platform providers
* Email marketing and CRM tools
* Analytics and advertising partners (e.g. Meta, Google – via cookies/pixels)
* Delivery and logistics partners
* Professional advisers (lawyers, accountants, etc.)
* Authorities or regulators where required by law

All such providers are required to keep your data safe and use it only for the services they provide to us.
            `,
        },
        {
            title: "5. International transfers",
            content: `
Some of our service providers may be located outside the UK/EEA. Where this happens, we will make sure appropriate safeguards are in place, such as:

* Adequacy decisions by the UK/EU; or
* Standard Contractual Clauses (SCCs) or equivalent mechanisms.

You can contact us if you want more information about transfers and safeguards.
            `,
        },
        {
            title: "6. How long we keep your data",
            content: `
We keep your personal data only for as long as necessary for the purposes described above, including to meet legal, accounting or reporting requirements. For example:

* Orders and transaction records – typically kept for up to 6 years for tax/accounting reasons (or as required by law).
* Marketing data – kept until you withdraw consent / unsubscribe or if you are inactive for a long period.
* Ambassador/influencer data – kept while you work with us and for a reasonable period afterwards for records.

We will securely delete or anonymise your data when it is no longer required.
            `,
        },
        {
            title: "7. Your data protection rights",
            content: `
Under UK/EU data protection law, you have the right to:

* Access – request a copy of the personal data we hold about you.
* Rectification – ask us to correct or update inaccurate or incomplete data.
* Erasure – ask us to delete your data where there is no good reason for us to keep it (“right to be forgotten”), subject to legal obligations.
* Restriction – ask us to restrict the processing of your data in certain circumstances.
* Objection – object to processing based on our legitimate interests or for direct marketing.
* Data portability – ask for your data in a structured, commonly used, machine-readable format, and to transfer it to another controller where applicable.
* Withdraw consent – where we rely on consent (e.g. email marketing), you can withdraw it at any time.

To exercise any of these rights, contact us at: [insert privacy email].

We may need to verify your identity before acting on your request.

If you are not happy with how we handle your data, you can also complain to your local supervisory authority. In the UK, this is the Information Commissioner’s Office (ICO).
            `,
        },
        {
            title: "8. Children",
            content: `
Our website and products are not directed at children under 16.

We do not knowingly collect personal data from children under 16. If you believe we have data about a child, please contact us and we will delete it.
            `,
        },
        {
            title: "9. Security",
            content: `
We take appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, misuse or disclosure. However, no system is completely secure and we cannot guarantee absolute security.
            `,
        },
        {
            title: "10. Changes to this policy",
            content: `
We may update this Policy from time to time. Any changes will be posted on this page with an updated “Last updated” date.
Where appropriate, we will notify you by email or via our website.
            `,
        },
    ];

    return (
        <div className="w-full bg-white text-[var(--text-primary)]">

            {/* HERO SECTION */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        This Privacy Policy outlines how Gazaarabia collects, uses, and protects your information with transparency and care.
                    </p>
                    {/* <div className="mt-6 inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
                        <p className="text-sm text-white/90">
                            <span className="font-medium">Last updated:</span> November 21, 2025
                        </p>
                    </div> */}


                </div>
            </section>

            {/* MAIN CONTENT */}
            <section className="relative py-20 bg-[var(--soft-gray)] overflow-hidden">

                {/* Background accents */}
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem] 
        bg-[var(--brand-secondary)] opacity-10 blur-3xl 
        -translate-x-40 -translate-y-20"></div>

                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem] 
        bg-[var(--brand-primary)] opacity-10 blur-3xl 
        translate-x-20 translate-y-20"></div>

                {/* Main content wrapper MUST stay above background */}
                <div className="max-w-5xl mx-auto px-6 relative z-10">


                    {/* === */}

                    <div className="space-y-16">
                        {sections.map((section, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <h3 className="text-xl md:text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                                    {section.title}
                                </h3>

                                <p className="text-[var(--text-secondary)] text-base leading-relaxed whitespace-pre-line">
                                    {section.content}
                                </p>

                                {/* KEEP THE BUTTON EXACTLY LIKE BEFORE */}
                                {section.title === "10. Changes to this policy" && (
                                    <div className="mt-6 flex justify-center">
                                        <a
                                            href="/contact"
                                            className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition text-base"
                                        >
                                            Contact Our Privacy Team
                                        </a>
                                    </div>
                                )}

                                {index !== sections.length - 1 && (
                                    <div className="mt-12 border-b border-[var(--mid-gray)] opacity-30"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* ==== */}

                </div>
            </section>
        </div>
    );
}
