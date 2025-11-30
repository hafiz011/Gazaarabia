"use client";

import { motion } from "framer-motion";

export default function CookiesPolicyPage() {
    return (
        <div className="w-full bg-white text-[var(--text-primary)]">

            {/* HERO */}
            <section className="relative bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)] text-white py-20 text-center overflow-hidden">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative z-10 max-w-4xl mx-auto px-6">

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
                        Cookies Policy
                    </h1>

                    <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
                        This page explains how GazaArabia uses cookies and similar technologies across our website.
                    </p>

                    <div className="mt-6 inline-block bg-white/10 backdrop-blur-md px-6 py-3 rounded-lg border border-white/20">
                        <p className="text-sm text-white/90">
                            <span className="font-medium">Last Updated:</span>November 21, 2025
                        </p>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT WITH BACKGROUND ACCENTS */}
            <section className="relative py-20 bg-[var(--soft-gray)] overflow-hidden">

                {/* Background accents (same as other policy pages) */}
                <div className="absolute top-0 left-0 w-[35rem] h-[35rem]
                    bg-[var(--brand-secondary)] opacity-10 blur-3xl
                    -translate-x-40 -translate-y-20"></div>

                <div className="absolute bottom-0 right-0 w-[35rem] h-[35rem]
                    bg-[var(--brand-primary)] opacity-10 blur-3xl
                    translate-x-20 translate-y-20"></div>

                <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-16">

                    {/* 1. What are cookies? */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            1. What are cookies?
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            Cookies are small text files stored on your device (computer, tablet, phone) when you visit a website.
                            They help the site remember your actions and preferences (like login, basket items, and language)
                            and allow us to understand how our website is used.

                            {"\n\n"}We use the term “cookies” to include cookies, pixels, tags and similar tracking technologies.
                        </p>
                    </motion.div>

                    {/* 2. How we use cookies */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            2. How we use cookies
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            We use cookies for the following purposes:

                            {"\n\n"}<b>Strictly necessary cookies</b>
                            {"\n"}– Needed for the website to function properly.
                            {"\n"}Examples:
                            {"\n"}• Remembering what’s in your shopping basket
                            {"\n"}• Enabling checkout and payment
                            {"\n"}• Keeping you logged in to your account
                            {"\n"}– You cannot switch these off via our cookie banner as the site won’t work properly without them.

                            {"\n\n"}<b>Performance & analytics cookies</b>
                            {"\n"}– Help us understand how visitors use our site.
                            {"\n"}– Measure traffic, popular pages, and how people move around the site.
                            {"\n"}– Examples: Google Analytics or similar tools.
                            {"\n"}– We use this information to improve our website and user experience.

                            {"\n\n"}<b>Functional cookies</b>
                            {"\n"}– Remember your preferences (such as language, region, or saved details)
                            {"\n"}– Make your experience smoother and more personalised.

                            {"\n\n"}<b>Advertising & social media cookies</b>
                            {"\n"}– Set by us and/or our advertising partners (e.g. Meta, Google, TikTok)
                            {"\n"}– Help us show relevant ads to you on other platforms
                            {"\n"}– Track performance of campaigns (e.g. how many people clicked an ad and bought something)
                            {"\n"}– May be used to build a profile of your interests.

                            {"\n\n"}Non-essential cookies (analytics, advertising, etc.) will only be used where you have given consent, depending on your location and applicable law.
                        </p>
                    </motion.div>

                    {/* 3. Cookies we may use */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            3. Cookies we may use
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            Examples of the types of cookies we may use on our site (this will depend on the tools you actually use):

                            {"\n"}• ga, _gid, _gat – Google Analytics (analytics/performance)
                            {"\n"}• fbp, fr – Facebook/Meta Pixel (advertising/remarketing)
                            {"\n"}• Session cookies for the shopping cart and checkout (strictly necessary)

                            {"\n\n"}Your developer should update the real list once the tech stack is final (Shopify, custom, etc.).
                        </p>
                    </motion.div>

                    {/* 4. Managing your cookie preferences */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            4. Managing your cookie preferences
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            When you first visit our website, you will see a cookie banner allowing you to accept or manage cookies.

                            {"\n"}You can choose to:
                            {"\n"}• Accept all
                            {"\n"}• Reject non-essential
                            {"\n"}• Customise preferences

                            {"\n\n"}You can change your preferences anytime using the “Cookie Settings” option.

                            {"\n\n"}You can also control cookies through your browser settings:
                            {"\n"}• Delete existing cookies
                            {"\n"}• Block cookies
                            {"\n"}• Only accept certain types

                            {"\n\n"}Please note: if you block or delete some cookies, parts of our website may not work properly (for example, you may not be able to use the basket or checkout).

                        </p>
                    </motion.div>

                    {/* 5. Third-party cookies */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            5. Third-party cookies
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            Some cookies may be placed by third parties when you visit our website. For example:

                            {"\n"}• Analytics providers
                            {"\n"}• Social media networks
                            {"\n"}• Advertising networks

                            {"\n\n"}These providers have their own cookie and privacy policies.
                        </p>
                    </motion.div>

                    {/* 6. Changes */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            6. Changes to this Cookies Policy
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            We may update this Cookies Policy from time to time to reflect changes in technology, law or our services. Any updates will be posted on this page with an updated “Last updated” date.
                        </p>
                    </motion.div>

                    {/* 7. Contact */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
                        <h2 className="text-2xl font-semibold text-[var(--brand-primary)] mb-4">
                            7. Contact
                        </h2>
                        <p className="text-[var(--text-secondary)] whitespace-pre-line leading-relaxed">
                            If you have any questions about cookies or this policy, you can contact us at:
                            {"\n"}support@gazaarabia.com
                        </p>
                    </motion.div>

                </div>

                <div className="mt-10 flex justify-center">
                    <a
                        href="mailto:support@gazaarabia.com"
                        className="inline-block bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-primary)]
        text-white font-medium px-10 py-3 rounded-lg hover:opacity-90 transition text-base shadow-md"
                    >
                        Contact Support Team
                    </a>
                </div>

            </section>
        </div>
    );
}
